import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react'

interface PostUploadProps {
    image:  {localUrl: string, storedUrl?: string, storedName?: string, imageFile: File} | null;
    setImage: (image:  {localUrl: string, storedUrl?: string, storedName?: string, imageFile: File} | null) => void;
}

function PostUpload({image, setImage}: PostUploadProps) {

    const [results, setResults] = useState([]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
        
        const fileName = 'test'
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a preview URL
        const imageUrl = URL.createObjectURL(file);
        // Store inside state
        // uploadImage(imageFile);
        const { publicUrl} = await supabaseUpload(file)
        setImage({
            localUrl: imageUrl,
            storedName: fileName,
            storedUrl: publicUrl, 
            imageFile: file
        });
        // getSimilar(publicUrl);
        console.log('Public URL:', publicUrl, fileName);
        // uploadImage(fileName, publicUrl);        
        // console.log('post to /image/upload result: ', result);
    }




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

    const supabaseUpload= async(imageFile: File) => {
        const formData = new FormData();
            formData.append('imageName', `image_${Date.now()}`);
            formData.append('file', imageFile);

        const res = await fetch('https://xlpwosvjzyffqmiicqpf.supabase.co/functions/v1/upload-image', {
            method: "POST",
            body: formData
        })
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.error || "Upload failed");
        }
        console.log(data);

        return { fileName: data.fileName, publicUrl: data.publicUrl };
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
        <div className={`upload-wrapper flex flex-col items-center rounded-2xl ${image && 'relative hover:bg-black'}`}>
            
            {!image ? (
                <label htmlFor="dropzone-file" className="background: rgba(0, 0, 0, 0.001); upload-img flex flex-col items-center justify-center w-full h-64 rounded-md border border-default-strong border-gray-300 rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
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
                        src={image.localUrl} 
                        alt="uploaded-preview" 
                        className={`rounded-2xl object-contain object-center max-h-[40vh] hover:opacity-50 `}
                    />
                    <Icon   
                        icon="mdi:trash-can-outline" 
                        height="25" 
                        width="25" 
                        className="text-gray-900 absolute top-0 right-0 cursor-pointer"
                        onMouseOver={(e)=>e.preventDefault()}
                        onClick={()=>{
                            handleCancelUpload();
                        }} />
                </>
            )
            }
            
            {/* <button
                onClick={()=>uploadImage('')}
                className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >upload image & index it</button> */}
            {/* <button
                onClick={()=>getSimilar('')}
                className='bg-gray-900 text-white cursor-pointer px-3 rounded-sm py-1 m-2'
            >test similarity</button> */}
        </div>
    )
}

export default PostUpload