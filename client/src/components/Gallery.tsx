// File: client\src\components\Gallery.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLoading } from '../LoadingContext';
import { randomOwners, type ImageData, type PostData } from '../data';
import { matchAlbumCovers } from './AudioSelector';
import { Icon } from '@iconify/react';
import { useSongManager } from '../SongContext';

interface GalleryProps{
    similarityUrl?: string
    header?: React.ReactNode
    mainClass?: string
    embedPosts?: PostData[]
}

export function Gallery({header, similarityUrl, mainClass, embedPosts}: GalleryProps) {
    const [posts, setPosts] = useState<PostData[]>(embedPosts || []);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    const { isLoading, setIsLoading } = useLoading();
    const { playSong, stopSong, togglePlaybackEnabled, isPlaybackEnabled, songs } = useSongManager();

    //handling similarity
    useEffect(() => {
        if (!songs || songs.length === 0) return
        
        if (!similarityUrl) {
            fetchAny()
            return;
        }
        // Only fetch similar images if songs are loaded
        fetchSimilarImages(similarityUrl);

    }, [similarityUrl, songs]);

    const fetchSimilarImages = async (imageUrl: string) => {
        try {
            setIsLoading(true);
            setPosts([]);
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10,
            });
            const filtered = filterImages(result.data.results);
            setPosts(setFakePosts(filtered));
        } catch (error) {
            //console.error('Error fetching similar images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setFakePosts = (images: ImageData[]): PostData[] => {
        // Safety check: ensure songs are available
        if (!songs || songs.length === 0) {
            console.warn('No songs available to assign to posts');
            return images.map((image: ImageData) => ({
                image: image, 
                song: null, 
                owner: randomOwners[Math.floor(Math.random() * randomOwners.length)]
            })) as PostData[];
        }
        
        const newPosts = images.map((image: ImageData) => ({
            image: image, 
            song: songs[Math.floor(Math.random() * songs.length)], 
            owner: randomOwners[Math.floor(Math.random() * randomOwners.length)]
        })) as PostData[];

        if (newPosts) {
            return [...embedPosts ?? [], ...newPosts];
        } else {
            return [];
        }
    };

    const filterImages = (urls: Object[]): ImageData[] => {
        const set = new Set<string>();

        const unique = urls.filter((item: any) => {
            if (!item.imageUrl) return false;
            if (set.has(item.imageUrl)) return false;
            set.add(item.imageUrl);
            return true;
        });

        return unique.map((item: any) => ({
            localUrl: item.imageUrl,
        })) as ImageData[];
    };

    const fetchAny = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get("http://localhost:8000/image/fetch-any");
            const filtered = filterImages(result.data.results);
            setPosts(setFakePosts(filtered));
        } catch (error) {
            //console.error("Sample fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePlayback = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlaybackEnabled();
    };

    const renderImages = () => {
        // Show skeleton while songs are loading OR while posts are being fetched
        if (!songs || !posts || posts.length === (embedPosts?.length || 0)) {
            return (
                <>
                    {renderSkeletonColumn()}
                    {renderSkeletonColumn()}
                </>
            );
        }

        const mid = Math.ceil(posts.length / 2);
        const left = posts.slice(0, mid);
        const right = posts.slice(mid);

        const renderColumn = (col: typeof posts, startIndex: number) => (
            <div className="grid gap-4 h-[fit-content]">
                {col.map((post, colIndex) => {
                    const globalIndex = startIndex + colIndex;
                    return (
                        <div
                            key={`${post.owner}-${globalIndex}`}
                            className="relative group cursor-pointer"
                            onMouseEnter={() => {
                                setHoveredIndex(globalIndex);
                                if (post.song) {
                                    playSong(post.song);
                                }
                            }}
                            onMouseLeave={() => {
                                setHoveredIndex(null);
                                stopSong();
                            }}
                            onClick={handleTogglePlayback}
                        >
                            <img
                                className="block w-full h-auto rounded-lg object-cover"
                                src={post.image.storedUrl ?? post.image.localUrl}
                                alt="gallery-photo"
                            />

                            {/* Overlay */}
                            <div
                                className="
                                pointer-events-none
                                absolute inset-0
                                rounded-lg
                                opacity-0
                                group-hover:opacity-100
                                transition-opacity duration-300
                                bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent_20%),linear-gradient(to_top,rgba(0,0,0,0.7),transparent_20%)]
                                "
                            />

                            {/* header - show icon based on playback state */}
                            <span className="group-hover:opacity-100 opacity-0 absolute top-2 left-0 text-xs text-white px-2 py-0.5 rounded">
                                {isPlaybackEnabled ? (
                                    <Icon icon="fluent:music-note-2-20-filled" width="16" height="16" />
                                ) : (
                                    <Icon icon="fluent:music-note-off-2-20-filled" width="16" height="16" />
                                )}
                            </span>

                            {/* footer */}
                            <p className="group-hover:opacity-100 opacity-0 absolute bottom-2 left-2 text-white text-sm max-w-60 truncate ellipsis">
                                @{post.owner}
                            </p>
                            {post.song && (
                                <img 
                                    src={matchAlbumCovers(post.song?.title, 0)}
                                    alt="album cover" 
                                    className="group-hover:opacity-100 opacity-0 absolute bottom-2 right-2 rounded-2xl h-5 w-5 border-1 border-white"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );

        return (
            <>
                {renderColumn(left, 0)}
                {renderColumn(right, mid)}
            </>
        );
    };

    const renderSkeletonColumn = (items = 4) => (
        <div className="grid gap-4 h-[fit-content]">
            {Array.from({ length: items }).map((_, i) => {
                const h = Math.random() < 0.5 ? 200 : 230;
                return (
                    <div
                        key={i}
                        className="w-full rounded-lg skeleton-box"
                        style={{ height: `${h}px` }}
                    />
                );
            })}
        </div>
    );

    return (
        <div className={`w-full h-[inherit] flex flex-col zIndex-10 ${mainClass}`}>
            {header}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 w-full p-2">
                {renderImages()}
            </div>
        </div>
    );
}