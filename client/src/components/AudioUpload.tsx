import { Icon } from '@iconify/react'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

function AudioUpload() {

    const [res, setRes] = useState<string[]|''>('');

    useEffect(() => {
        // playSong();
        fetchSong();
        // fetchSomeSongs();
    },[])

    const fetchSomeSongs = async () => {
    const response = await axios.get("http://localhost:8080/music/preview-tracks");
        console.log(response.data); 
        setRes(response.data);
    }

    const fetchSong = async () => {

        const title = 'Shape of You';
        const artist = 'Ed Sheeran';
        const limit = 1;
        const response = await axios.get(`http://localhost:8080/music/search`);
        console.log(response.data.results[0]);
        setRes(response.data.results[0].previewUrls[0]);
    };

    const playSong = async () => {
        if (!res) return;
        const audio = new Audio(`http://localhost:8080/music/proxy-preview?url=${encodeURIComponent(res[0])}`);
        audio.play();
    };


  return (
    <>
        <div className="flex justify-center items-center w-full ">
            <div
                className="bg-gray-100 h-auto flex gap-1 justify-start items-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl">
                {/* ALBUM COVER */}
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs3pvw2oSLc9tpwVby2WnmtAgYLWP3tu3Lww&s" 
                    alt="album cover" className="rounded-2xl h-8 " />

                {/* SONG TITLE */}
                <p className="text-start text-xs font-semibold grow">
                    Roxette<br /><span className="text-xs font-normal">Sleeping in my car</span>
                </p>

                {/* PLAY ICON */}
                <span
                    onClick={()=>{playSong()}} 
                    className="clear-left rounded-full bg-[#eff0f9] h-10 w-10 cursor-pointer flex items-center justify-center group">
                <span className="bg-white h-6 w-6 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 4v16l13 -8z" />
                    </svg>
                </span>
                </span>

                <Icon 
                    icon="mdi:add-circle" height="20" width="20" 
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    className="absolute right-[-1.5rem] cursor-pointer text-gray-500 hover:text-blue-600" 
                    
                    />

                {/* <audio controls src={res[0]}></audio> */}
            </div>
        </div>
        {/* delete icon */}
    </>
  )
}

export default AudioUpload