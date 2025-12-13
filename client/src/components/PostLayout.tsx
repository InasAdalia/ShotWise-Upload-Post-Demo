import { useEffect, useState } from 'react'
import { Gallery } from './Gallery'
import PostUpload from './PostUpload'
import AudioUpload from './AudioUpload';
import { Icon } from '@iconify/react';
import type { SongData, ImageData, PostData } from '../data';
import { useNavigate } from 'react-router-dom';



function PostLayout() {
    
    //post data
    const [image, setImage] = useState<ImageData | null>(JSON.parse(localStorage.getItem('imageData') ?? 'null')); //stores image urls
    const [songUrls, setSongUrls] = useState<{ selected: SongData | null, lists: SongData[]}>(JSON.parse(localStorage.getItem('songData') ?? '[]')); // Add this
    const navigate = useNavigate();
    
    useEffect(()=>{
        // console.log('image', image)
        //fetch from local storage upon page load/ refresh
        // setImage();
        // setSongUrls(JSON.parse(localStorage.getItem('songUrlsState') ?? 'null'));
    })

    useEffect(()=>{
        // console.log(image)
    }, [image])

    const handlePost=()=>{
        if (!image) return;
        const prevEmbeddedPosts = JSON.parse(localStorage.getItem('feedEmbeds') ?? '[]') as PostData[];
        const postData : PostData = {image, song: songUrls.selected, owner: 'you'}
        localStorage.setItem('feedEmbeds', JSON.stringify([...prevEmbeddedPosts, postData]));
        navigate('/feed');
        // remove previous upload draft
        localStorage.removeItem('imageData');
        localStorage.setItem('songData', JSON.stringify({selected: null, lists: songUrls.lists}));
    }

    return (
        <div className="post-layout space-y-4 w-[inherit] text-black flex flex-col max-h-[98vh] items-center overflow-y-auto scrollbar-hide">
            
            
            <img src={image?.localUrl ?? '/wallpaper3.jpg'} alt="post preview" className="upload-bg w-full h-full object-cover object-center" />
            
            
            {/* Page Header */}
            <div className="w-full flex items-center ">
                <h6 className="text-lg mt-1 text-gray-900 justify-center flex-grow">
                Share post
                </h6>
            </div>

            {/* Subheader */}
            <div className="px-2 flex flex-row justify-between align-center w-100 min-h-7 relative">
                <Icon icon="mdi:chevron-left" height="25" width="25" 
                    className="z-2 absolute left-2 top-0 ml-2 text-gray-900 cursor-pointer" 
                    onClick={() => {navigate(-1)}}
                />
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-2.5px] z-1 w-full h-full">
                    <AudioUpload enabled={image !== null} songUrls={songUrls} setSongUrls={setSongUrls} />
                </div>
                <button 
                    onClick={handlePost} 
                    className="z-3 absolute right-2 top-0 glassy-bg bg-blue-900font-semibold text-blue-600 text-sm mr-4 px-4 py-1 rounded-xl shadow-lg align-self-end cursor-pointer">
                    Post
                </button>
            </div>

            {/* <AudioSelector onClose={()=>{}} songUrls={{ selected: null, lists: [] }} setSongUrls={()=>{}} /> */}

            <div
              className={`flex flex-col gap-2 items-center justify-center w-full`}
            >   
                {/* image upload */}
                <div className = {`max-w-60 min-h-[40vh] ${image ? 'max-w-auto aspect-auto' : ''}`}>
                    <PostUpload 
                        image={image} 
                        setImage={setImage} 
                    />
                </div>

                {/* description input */}
                <textarea
                disabled={!image}
                placeholder="Description"
                className="normal-box text-gray-900 text-sm w-70 h-[100px] p-2 rounded-[15px] bg-gray-100 border border-gray-100 focus:outline-none focus:border-blue-200 resize-none"
                ></textarea>
            </div>

            { image?.storedUrl && image?.storedName ? <Gallery 
                similarityUrl={{
                    imageName: image?.storedName, 
                    imageUrl: image?.storedUrl
                }} 
                header = {
                    <div className="inline-flex items-center align-self-start gap-1 px-2 text-sm font-medium text-gray-800 mb-2">
                        See more
                        <Icon icon="mdi:arrow-down" height="16" width="16" />
                    </div>
                }
                />
            : <Gallery 
                header = {
                    <div className="inline-flex items-center align-self-start gap-1 px-2 text-sm font-medium text-gray-800 mb-2">
                        See more
                        <Icon icon="mdi:arrow-down" height="16" width="16" />
                    </div>
                }
                />
            }
        </div>
    )
}

export default PostLayout