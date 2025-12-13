import { Icon } from '@iconify/react';
import React, { useEffect } from 'react'
import { useLoading } from '../LoadingContext';
import { type ImageData } from '../data';

interface PostUploadProps {
    image:  ImageData | null;
    setImage: (image:  ImageData | null) => void;
}

function PostUpload({image, setImage}: PostUploadProps) {

    const { isLoading, setIsLoading } = useLoading();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
        
        try {
            setIsLoading(true);
            const fileName = 'test'
            const file = e.target.files?.[0];
            if (!file) return;

            // Create a preview URL
            const imageUrl = URL.createObjectURL(file);

            const { publicUrl} = await supabaseUpload(file)
            setImage({
                localUrl: imageUrl,
                storedName: fileName,
                storedUrl: publicUrl, 
                imageFile: file
            });

            localStorage.setItem('imageData', JSON.stringify({
                localUrl: imageUrl,
                storedName: fileName,
                storedUrl: publicUrl
                // file is already uploaded into supabase, so retrieve image using storedUrl instead.
            }))
            // console.log('Public URL:', publicUrl, fileName);
            
        } catch (error) {
            
        } finally{
            setIsLoading(false);
        }
        // console.log('post to /image/upload result: ', result);
    }

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

        return { fileName: data.fileName, publicUrl: data.publicUrl };
    }


    
    const handleCancelUpload=async()=>{
        setImage(null);
        //call delete api
    }

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        // The image failed to load, try using the storedUrl instead
        event.currentTarget.src = image?.storedUrl || '';
    };


    return (
        <div className={`upload-wrapper group flex flex-col items-center rounded-2xl ${image && 'relative hover:bg-black'} ${!image ? 'upload-shadow-animate' : ''} ${image && 'relative hover:bg-black'}`}>
            
            {!image ? 
            
                !isLoading ? (
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
                 <div className="skeleton-box h-64 w-60 rounded-2xl"/>
                ):(
                <>
                    {/* display the img */}
                    <img 
                        src={image.localUrl || image.storedUrl || ''} 
                        onError={(event) => {
                            handleImageError(event);
                        }}
                        alt="uploaded-preview" 
                        className={`rounded-2xl object-contain object-center max-h-[40vh] group-hover:opacity-50 `}
                    />
                    
                    <Icon   
                        icon="mdi:trash-can-outline" 
                        height="20" 
                        width="20" 
                        className="group-hover:opacity-100 opacity-0 text-gray-900 absolute top-2 right-2 cursor-pointer"
                        onMouseOver={()=>{}}
                        onClick={()=>{
                            handleCancelUpload();
                        }} />
                </>
            )}
        </div>
    )
}

export default PostUpload