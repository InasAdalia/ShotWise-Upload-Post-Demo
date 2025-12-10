import { Icon } from '@iconify/react';
import axios from 'axios';
import type { PostImage } from './PostLayout';
import { useEffect, useState } from 'react';
import { imageDataset } from '../data';

interface GalleryProps{
    similarityUrl?: {imageName: string, imageUrl: string}
}
export function Gallery({similarityUrl}: GalleryProps) {
    
    const [images, setImages] = useState<PostImage[]>([]);

    useEffect(()=>{
        fetchAny()
    },[])

    useEffect(() => {
        if (!similarityUrl?.imageUrl) return;
        fetchSimilarImages(similarityUrl.imageUrl);
    }, [similarityUrl?.imageUrl]);

    // const bulkUploadAndIndex = async () => {
    //     try {

    //         imageDataset.forEach((image, index) => {
    //             uploadImage(`image_${index}`, image);
    //         })
    //     } catch (err) {
    //         console.error('Bulk upload error:', err);
    //     }   
    // };
    
    // const uploadImage = async (imageName: string, imageUrl: string) => {
    //     try {
    //         console.log('Uploading and indexing image into Pinecone...');
            
    //         const result = await axios.post(
    //             "http://localhost:8000/image/upload-and-index",{
    //             imageName,
    //             imageUrl
    //         });
            
    //         console.log('✅ Upload complete:', result.data);
    //         console.log('Public URL:', result.data.publicUrl);
            
    //         return result.data;
            
    //     } catch (err) {
    //         console.error("❌ Upload error:", err);

    //     }
    // };

    const fetchSimilarImages=async(imageUrl: string)=>{
        try {
            console.log('Searching for similar images...');
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10, // Return top 10 similar images
            });
            const filtered = filterImages(result.data.results);
            setImages(filtered);
        
            console.log('Similar images:', result.data.results);
            return result.data.results;
        } catch (error) {
            
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
            const result = await axios.get("http://localhost:8000/image/fetch-any");
            const filtered = filterImages(result.data.results);
            setImages(filtered);
            console.log("filtered", filtered);
        } catch (error) {
            console.error("Sample fetch error:", error);
        }
    };


    const renderImages = () => {
        if (!images || images.length === 0) {
            return (
                <>
                    loading
                </>
            );
        }

        const mid = Math.ceil(images.length / 2);
        const left = images.slice(0, mid);
        const right = images.slice(mid);

        const renderColumn = (col: typeof images) => (
            <div className="grid gap-4">
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

    return (
        <div className="w-full flex flex-col zIndex-10">
            {/* <button
            onClick={bulkUploadAndIndex}
            className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >
                bulk upload & index all
            </button> */}
            <div className="inline-flex items-center align-self-start gap-1 text-sm font-medium text-gray-900 mb-2"
            onClick={()=>{console.log('scroll down till full view of gallery')}}>
                See more
                <Icon icon="mdi:arrow-down" height="16" width="16" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 w-full">
                {renderImages()}
            </div>
        </div>
    );
}