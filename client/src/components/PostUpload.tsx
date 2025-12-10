import { Icon } from '@iconify/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { images } from '../data';

interface PostUploadProps {
    image: string | null;
    setImage: (image: string | null) => void;
}

function PostUpload({image, setImage}: PostUploadProps) {

    const [results, setResults] = useState([]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
        const storedImage = localStorage.getItem('imageUrl');
        
        // if (storedImage) {
        //     // Use the stored image URL
        //     console.log('Using stored image URL');
        //     setImage(storedImage);
        //     return;
        // }
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a preview URL
        const imageUrl = URL.createObjectURL(file);
        localStorage.setItem('imageUrl', imageUrl);

        // Store inside state
        setImage(imageUrl);
        uploadImage(imageUrl);
        // TODO:
        //to prevent uploading duplicate images into sentisight
        // 1. by locally storing names and urls of uploaded images
        //when click share, save image to supabase. 

        
        // console.log('post to /image/upload result: ', result);
    }

    const bulkUploadAndIndex = async () => {
        try {
            console.log('Bulk uploading images...');
            const result = await axios.post("http://localhost:8000/image/bulk-upload-and-index", {
            images: images, // your array defined in the component
            });

            console.log('Bulk index result:', result.data);
            setResults(result.data.images || []);
        } catch (err) {
            console.error('Bulk upload error:', err);
    }
    };


    const uploadImage = async (imageUrl: string) => {
        try {
            console.log('Uploading and indexing image...');
            
            const result = await axios.post("http://localhost:8000/image/upload-and-index", {
                imageName: `image_${Date.now()}`, // Generate unique name
                imageUrl: imageUrl, // Must be publicly accessible URL
            });
            
            console.log('Image indexed:', result.data);
            return result.data.imageName;
            
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    const getSimilar=async()=>{
        try {
            const imageUrl = 'https://i.pinimg.com/736x/09/29/48/0929482167f227dcb17d834732079035.jpg';
            console.log('Searching for similar images...');
        
            const result = await axios.post("http://localhost:8000/image/similarity-search", {
                imageUrl: imageUrl,
                topK: 10, // Return top 10 similar images
            });
        
        console.log('Similar images:', result.data.results);
        } catch (error) {
            
        }
    }
    
    

    const handleCancelUpload=async()=>{
        setImage(null);
        try {
            
            console.log("DELETION: post to /image/delete result: ");
        } catch (err) {
            console.error("axios /image/delete error:", err);
        }
        //call delete api
    }

    useEffect(()=>{
        console.log('PostUpload component image:', image);
        // uploadImage();
    }, [image])

    return (
        <div className={`w-full flex flex-col items-center rounded-lg ${image && 'relative hover: bg-black'}`}>
            
            {!image ? (
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 bg-gray-100 rounded-md border border-default-strong border-gray-300 rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                    <>
                        <div className="flex flex-col items-center justify-center text-body pt-5 pb-6 mx-6">
                            <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/></svg>
                            <p className="mb-2 text-sm"><span className="font-semibold">Upload image</span></p>
                            <p className="text-xs">We recommend using high quality jpg files less than 20MB</p>
                        </div>
                        <input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden"
                            onChange={handleUpload} 
                        />
                    </>
            </label>
            ): (
                <>
                    {/* display the img */}
                    <img 
                        src={image} 
                        alt="uploaded-preview" 
                        className={`rounded-lg object-contain object-center max-h-[40vh] hover:opacity-50 `}
                    />
                    <Icon   
                        icon="mdi:trash-can-outline" 
                        height="25" 
                        width="25" 
                        className="text-gray-900 absolute top-0 right-0 cursor-pointer"
                        onClick={()=>{
                            handleCancelUpload();
                        }} />
                </>
            )
            }
            <button
            onClick={bulkUploadAndIndex}
            className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >
                bulk upload & index all
            </button>
            {/* <button
                onClick={()=>uploadImage(image ?? '')}
                className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >upload image & index it</button> */}
            <button
                onClick={()=>getSimilar()}
                className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >test similarity</button>
        </div>
    )
}

export default PostUpload