import React, { useEffect, useState } from 'react'
import { Gallery } from './Gallery'
import PostUpload from './PostUpload'
import AudioUpload from './AudioUpload';
import { Icon } from '@iconify/react';

export interface PostImage{
    localUrl: string, 
    storedUrl?: string, 
    storedName?: string, 
    imageFile: File
}

function PostLayout() {

    const [image, setImage] = useState<PostImage | null>(null); //stores image urls
    
    useEffect(()=>{
        console.log(image)
    }, [image])

    return (
        <div className=" p-2 space-y-4 w-[inherit] text-black flex flex-col max-h-[98vh] items-center overflow-y-auto scrollbar-hide">
            
            {/* effects & bg */}
            <div className="gradient-bottom-back"/>
            <div className="gradient-bottom-front"/>
            <img src={image?.localUrl ?? ''} alt="post preview" className="upload-bg w-full h-full object-cover object-center" />
            
            
            {/* Page Header */}
            <div className="w-full px-2 flex items-center ">
                <h6 className="text-xl text-gray-900 justify-center flex-grow">
                Share post
                </h6>
            </div>

            {/* Subheader */}
            <div className="flex flex-row justify-between align-center w-[100%] relative">
                <Icon icon="mdi:chevron-left" height="25" width="25" className="text-gray-900" />
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <AudioUpload />
                </div>
                <button className="glassy-button bg-blue-900 font-semibold text-blue-400 px-4 py-1 rounded-xl shadow-lg align-self-end hover:bg-blue-800 transition-colors">
                    Post
                </button>
            </div>

            <div
              className={`flex flex-col gap-2 items-center justify-center w-full`}
            >   
                {/* image upload */}
                <div className = {`max-w-60 ${image ? 'max-w-auto aspect-auto' : ''}`}>
                    <PostUpload 
                        image={image} 
                        setImage={setImage} 
                    />
                </div>

                {/* description input */}
                <input 
                    type="text" 
                    placeholder="Description" 
                    className="normal-box text-gray-900 text-sm w-70 h-[100px] p-2 rounded-[15px] bg-gray-100 border border-gray-100 focus:outline-none focus:border-blue-500"
                />
            </div>

            { <Gallery similarityUrl={{imageName: image?.storedName ?? '', imageUrl: image?.storedUrl ?? ''}} />}
        </div>
    )
}

export default PostLayout