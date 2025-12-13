// File: client\src\components\Gallery.tsx
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useLoading } from '../Context';
import { randomOwners, songLists, type ImageData, type PostData, type SongData } from '../data';
import { matchAlbumCovers } from './AudioSelector';
import { Icon } from '@iconify/react';

interface GalleryProps{
    similarityUrl?: {imageName: string, imageUrl: string}
    header?: React.ReactNode
    mainClass?: string
    embedPosts?: PostData[] //will be embedded during fetchAny()
}
export function Gallery({header, similarityUrl, mainClass, embedPosts}: GalleryProps) {
    
    const [posts, setPosts] = useState<PostData[]>(embedPosts || []);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null); 
    const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    // Create a global audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    

    // To resume
    audioContext.resume();
    
    // Use ref to always have the latest value
    const isPlaybackEnabledRef = useRef(isPlaybackEnabled);
    const hoveredIndexRef = useRef<number | null>(hoveredIndex);
    
    useEffect(() => {
        isPlaybackEnabledRef.current = isPlaybackEnabled;
    }, [isPlaybackEnabled]);

    useEffect(() => {
        hoveredIndexRef.current = hoveredIndex;
    }, [hoveredIndex]);

    const {setIsLoading } = useLoading();

    useEffect(()=>{
        // console.log('posts', posts)
        fetchAny()
    },[])

    useEffect(() => {
        if (!similarityUrl?.imageUrl){
            return;
        } 
        fetchSimilarImages(similarityUrl.imageUrl);
    }, [similarityUrl?.imageUrl]);

    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
        }

        // To pause all audio globally
        audioContext.suspend();
    };
    

    const playSong = async (songUrl: string, index: number) => {
        // Check the ref for the most current value
        if (!songUrl || !isPlaybackEnabledRef.current) return;

        stopAudio();

        const audio = new Audio(
            `http://localhost:8000/music/proxy-preview?url=${encodeURIComponent(songUrl)}`
        );

        audio.addEventListener('ended', () => {
            setCurrentAudio(null);
        });

        try {
            await audio.play();
            setCurrentAudio(audio);
        } catch (error) {
            console.error('Audio playback failed:', error);
        }
    };

    const togglePlayback = (e: React.MouseEvent, postIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsPlaybackEnabled(prev => {
            const next = !prev;
            
            // If turning OFF, stop current audio
            if (!next) {
                stopAudio();
            } 
            // If turning ON and this is the post we clicked on, play its song
            else if (posts[postIndex]?.song?.previewUrl) {
                playSong(posts[postIndex].song.previewUrl, postIndex);
            }
            
            return next;
        });
    };

    const fetchSimilarImages=async(imageUrl: string)=>{
        try {
            setIsLoading(true);
            setPosts([]);
            console.log('Searching for similar images...');
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10,
            });
            const filtered = filterImages(result.data.results);
            setPosts(setFakePosts(filtered));
        } catch (error) {
            
        } finally{
            setIsLoading(false);
        }
    }

    const setFakePosts = (images: ImageData[]) : PostData[] => {
        const songLists : SongData[] = localStorage.getItem('songData') ? JSON.parse(localStorage.getItem('songData') as string).lists : null;
        // console.log('songs', songLists)
        const newPosts = (images.map((image: ImageData) => (
            {
                image: image, 
                song: songLists[Math.floor(Math.random() * songLists.length)], 
                owner: randomOwners[Math.floor(Math.random() * randomOwners.length)]
            } as PostData
        ))) as PostData[];

        if (newPosts)
            return [...embedPosts?? [],...newPosts];
        else{
            console.warn('error setting posts:', newPosts);
            return [];
        }
    }

    const filterImages = (urls: Object[]) : ImageData[]=>{
        const set = new Set<string>();

        const unique = urls.filter((item: any) => {
            if (!item.imageUrl) return false;
            if (set.has(item.imageUrl)) return false;
            set.add(item.imageUrl);
            return true;
        });

        return unique.map((item: any) => ({
            localUrl: item.imageUrl,
        })) as ImageData[]
    }

    const fetchAny = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get("http://localhost:8000/image/fetch-any");
            const filtered = filterImages(result.data.results);
            setPosts(setFakePosts(filtered));
        } catch (error) {
            console.error("Sample fetch error:", error);
        } finally{
            setIsLoading(false);
        }
    };

    const renderImages = () => {
        if (!posts || posts.length === (embedPosts?.length || 0)) {
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
                            if (post.song?.previewUrl) {
                                playSong(post.song.previewUrl, globalIndex);
                            }
                        }}
                        onMouseLeave={() => {
                            setHoveredIndex(null);
                            stopAudio();
                        }}
                        onClick={(e) =>{ 
                            post.song?.previewUrl && !isPlaybackEnabled && playSong(post.song?.previewUrl, globalIndex);
                            togglePlayback(e, globalIndex)}}
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
                        <p className="group-hover:opacity-100 opacity-0 absolute bottom-2 left-2 text-sm text-white max-w-60 truncate ellipsis">@{post.owner}</p>
                        { post.song && <img src={matchAlbumCovers(post.song?.title, 0)}
                            alt="album cover" 
                            className={`group-hover:opacity-100 opacity-0 absolute bottom-2 right-2 rounded-2xl h-5 w-5 border-1 border-white}`} />}
                    </div>
                )})}
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