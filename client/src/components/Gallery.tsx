import axios from 'axios';
import type { PostImage } from './PostLayout';
import { useEffect, useState } from 'react';
import { useLoading } from '../Context';

interface GalleryProps{
    similarityUrl?: {imageName: string, imageUrl: string}
    header?: React.ReactNode
    mainClass?: string
}
export function Gallery({header, similarityUrl, mainClass}: GalleryProps) {
    
    const [images, setImages] = useState<PostImage[]>([]);
    const { setIsLoading } = useLoading();

    useEffect(()=>{
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
            setImages([]);
            console.log('Searching for similar images...');
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10, // Return top 10 similar images
            });
            const filtered = filterImages(result.data.results);
            setImages(filtered);
        
            // console.log('Similar images:', result.data.results);
            return result.data.results;
        } catch (error) {
            
        } finally{
            setIsLoading(false);
        }
    }

    //returns an array of object: { localUrl: ... }
    const filterImages = (urls: Object[]) : PostImage[]=>{

        const set = new Set<string>();

        const unique = urls.filter((item: any) => {
            if (!item.imageUrl) return false;
            if (set.has(item.imageUrl)) return false;
            set.add(item.imageUrl);
            return true;
        });

        return unique.map((item: any) => ({
            localUrl: item.imageUrl,
        })) as PostImage[]
    }

    const fetchAny = async () => {
        try {
            setIsLoading(true);
            const result = await axios.get("http://localhost:8000/image/fetch-any");
            const filtered = filterImages(result.data.results);
            setImages(filtered);
            // console.log("filtered", filtered);
        } catch (error) {
            console.error("Sample fetch error:", error);
        } finally{
            setIsLoading(false);
        }
    };

    const renderImages = () => {
        if (!images || images.length === 0) {
            return (
            <>
                {renderSkeletonColumn()}
                {renderSkeletonColumn()}
            </>
            );
    }

    const mid = Math.ceil(images.length / 2);
    const left = images.slice(0, mid);
    const right = images.slice(mid);

    const renderColumn = (col: typeof images) => (
        <div className="grid gap-4 h-[fit-content]">
        {col.map((image, index) => (
            <div key={`${image.localUrl}-${index}`}>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center gallery-images"
                src={image.localUrl}
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
            const h = i % 2 === 0 ? 200 : 230; // 200px or 230px
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