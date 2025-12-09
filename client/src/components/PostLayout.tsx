import React, { useEffect, useState } from 'react'
import { Gallery } from './Gallery'
import PostUpload from './PostUpload'
import AudioUpload from './AudioUpload';

function PostLayout() {

    const [image, setImage] = useState<string | null>(null); //stores image urls
    
    useEffect(()=>{
        console.log(image)
    }, [image])

    return (
        <div className="p-4 space-y-4 mb-4 text-black flex flex-col items-center max-h-[90vh] overflow-y-auto scrollbar-hide">
            
            <AudioUpload />
            <div
              className={`flex items-center justify-center max-w-60 
                ${image ? 'max-w-auto aspect-auto' : ''}`}
            >
                <PostUpload 
                    image={image} 
                    setImage={setImage} 
                />
            </div>

            <button className="bg-blue-900 self-end text-white text-base px-4 py-1 rounded-xl shadow-lg align-self-end hover:bg-blue-800 transition-colors">
                Share
            </button>
            

            <Gallery />
        </div>
    )
}

export default PostLayout