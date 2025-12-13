import { useEffect, useState } from 'react';
import type { PostData } from '../data';
import { Gallery } from './Gallery'
import Menu from './Menu'

function FeedLayout() {

    const [embeddedPosts] = useState<PostData[]>(JSON.parse(localStorage.getItem('feedEmbeds') ?? '[]'));

    //useEffect(()=>{console.log(embeddedPosts)}, []) 

    return (
        <div className="h-full py-2 relative">
            <img src={'/wallpaper1.jpg'} alt="post preview" className="upload-bg full-height w-full h-full object-contain object-center" />
            
            <Gallery
                embedPosts={embeddedPosts}
                mainClass='overflow-y-auto scrollbar-hide pb-10'
                header={
                    <div className="relative text-gray-100 px-2 bg-transparent flex flex-row justify-between items-center">
                        <input type="search" name="search" placeholder="Search" className="glassy-medium w-full h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"/>
                        <button type="submit" className="absolute right-2 inset-y-0 mt-3 mr-4">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" {...{ viewBox: "0 0 56.966 56.966", xmlnsXlink: "http://www.w3.org/1999/xlink" }}>
                                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"/>
                            </svg>
                        </button>
                    </div>
                } 
            />

            <Menu />
            
        </div>
    )
}

export default FeedLayout