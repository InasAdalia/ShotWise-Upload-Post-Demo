import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLoading } from '../Context';
import { randomOwners, songLists, type ImageData, type PostData } from '../data';

interface GalleryProps{
    similarityUrl?: {imageName: string, imageUrl: string}
    header?: React.ReactNode
    mainClass?: string
    embedPosts?: PostData[] //will be embedded during fetchAny()
}
export function Gallery({header, similarityUrl, mainClass, embedPosts}: GalleryProps) {
    
    const [posts, setPosts] = useState<PostData[]>(embedPosts || []);
    const { setIsLoading } = useLoading();

    useEffect(()=>{
        console.log('posts', posts)
        fetchAny()
    },[])

    useEffect(() => {
        if (!similarityUrl?.imageUrl){
            // fetchAny();
            return;
        } 
        fetchSimilarImages(similarityUrl.imageUrl);
    }, [similarityUrl?.imageUrl]);

    const fetchSimilarImages=async(imageUrl: string)=>{
        try {
            setIsLoading(true);
            setPosts([]);
            console.log('Searching for similar images...');
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10, // Return top 10 similar images
            });
            const filtered = filterImages(result.data.results);
            setPosts(setFakePosts(filtered));
        } catch (error) {
            
        } finally{
            setIsLoading(false);
        }
    }

    const setFakePosts = (images: ImageData[]) : PostData[] => {
        const newPosts = (images.map((image: ImageData) => (
            {
                image: image, 
                song: localStorage.getItem('songData') ? JSON.parse(localStorage.getItem('songData') as string).lists[Math.random()* songLists.length] : null, 
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

    //ensures no duplicate images
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
            // setPosts([...images, ...filtered]);
            console.log(setFakePosts(filtered));
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

    const renderColumn = (col: typeof posts) => (
        <div className="grid gap-4 h-[fit-content]">
        {col.map((post, index) => (
            <div
            className="relative"   
            key={`${post.owner}-${index}`}>
                <img
                    className="h-auto max-w-full rounded-lg object-cover object-center gallery-images"
                    src={post.image.storedUrl || post.image.localUrl}
                    alt="gallery-photo"
                />
            </div>
        ))}
        </div>
    );

    return (
        <>
        {renderColumn(left)}
        {renderColumn(right)}
        </>
    );
    };

    const renderSkeletonColumn = (items = 4) => (
        <div className="grid gap-4 h-[fit-content]">
            {Array.from({ length: items }).map((_, i) => {
            const h = Math.random() < 0.5 ? 200 : 230; // Randomly choose between 200px and 230px
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
            {/* <button
            onClick={bulkUploadAndIndex}
            className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >
                bulk upload & index all
            </button> */}
            {header}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 w-full p-2">
                {renderImages()}
            </div>
        </div>
    );
}