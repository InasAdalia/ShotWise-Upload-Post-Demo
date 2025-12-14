import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';
import { randomOwners, type ImageData, type PostData } from '../data';
import { useSongManager } from '../context/SongContext';
import Post from './Post';

interface GalleryProps{
    similarityUrl?: string
    header?: React.ReactNode
    mainClass?: string
    embedPosts?: PostData[]
}

export function Gallery({header, similarityUrl, mainClass, embedPosts}: GalleryProps) {
    const [posts, setPosts] = useState<PostData[]>(embedPosts || []);    
    const { setIsLoading } = useLoading();
    const { songs } = useSongManager();

    useEffect(() => {
        if (!songs || songs.length === 0) return
        
        if (!similarityUrl) {
            fetchAny()
            return;
        }
        // Only fetch similar images if songs are loaded
        fetchSimilarImages(similarityUrl);

    }, [similarityUrl, songs]);

    //Fetch 10 similar images from Pinecone
    const fetchSimilarImages = async (imageUrl: string) => {
        try {
            setIsLoading(true);
            setPosts([]);
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10,
            });
            const filtered = filterImages(result.data.results);
            setPosts(setupPostDetails(filtered));
        } catch (error) {
            //console.error('Error fetching similar images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    //Fetch any 10 images from pinecone
    const fetchAny = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get("http://localhost:8000/image/fetch-any");
            const filtered = filterImages(result.data.results);
            setPosts(setupPostDetails(filtered));
        } catch (error) {
            //console.error("Sample fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Assign songs and users to images
    const setupPostDetails = (images: ImageData[]): PostData[] => {
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

    // Pinecone results in duplicate images, so this removes duplicates
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

    // UI render logic
    const renderGrids = () => {
        // render skeleton posts while songs are loading OR while posts are being fetched
        if (!songs || !posts || posts.length === (embedPosts?.length || 0)) {
            return (
                <>
                    {renderSkeletonColumn(4, 1)}
                    {renderSkeletonColumn(4, 2)}
                </>
            );
        }

        const mid = Math.ceil(posts.length / 2);
        const left = posts.slice(0, mid);
        const right = posts.slice(mid);

        
        return (
            <>
                {renderColumn(left, 0)}
                {renderColumn(right, mid)}
            </>
        );
    };
    const renderColumn = (col: typeof posts, startIndex: number) => (
        <div className="grid gap-4 h-[fit-content]">
            {col.map((post, colIndex) => {
                const globalIndex = startIndex + colIndex;
                return (
                    <Post
                        isLoading={false}
                        post={post}
                        keyIndex={globalIndex}
                    />
                );
            })}
        </div>
    );
    const renderSkeletonColumn = (items = 4, colIndex : number) => (
        <div className="grid gap-4 h-[fit-content]">
            {Array.from({ length: items }).map((_, i) => {
                ;
                return (
                    Post({
                        isLoading: true,
                        post: null,
                        keyIndex: colIndex + '' + i
                    })
                );
            })}
        </div>
    );

    return (
        <div className={`w-full h-[inherit] flex flex-col zIndex-10 ${mainClass}`}>
            {/* render any header UI : search bar/ filters/ etc */}
            {header}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 w-full p-2">
                {renderGrids()}
            </div>
        </div>
    );
}