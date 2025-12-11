import { Icon } from '@iconify/react'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import AudioSelector, { matchAlbumCovers } from './AudioSelector';
import type { SongMeta } from '../data';

interface AudioUploadProps {
    enabled: boolean
    songUrls: { selected: SongMeta | null, lists: SongMeta[]}
    setSongUrls: (songUrls: { selected: SongMeta | null, lists: SongMeta[]}) => void
}

function AudioUpload({songUrls, setSongUrls, enabled}: AudioUploadProps) {

    const [showSelector, setShowSelector] = useState(false);
    const hasSelected = songUrls?.selected !==null && songUrls?.selected.previewUrl !== null;

    const playSong = async (songUrl: string) => {
        if (!songUrl) return;
        const audio = new Audio(`http://localhost:8000/music/proxy-preview?url=${encodeURIComponent(songUrl)}`);
        audio.play();
    };

    

    const renderSelectedSong = () => {
        return hasSelected ? (
            <div
                onClick={()=>{setShowSelector(!showSelector)}}
                className={`glassy-bg cursor-pointer hover:bg-grayhover:text-white h-[fit-content] w-auto max-w-50 flex gap-1 justify-center items-center px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                
                {/* ALBUM COVER */}
                <img src={matchAlbumCovers(songUrls?.selected?.title ?? 'random1', 0)}
                    alt="album cover" className="rounded-2xl h-6 " />

                {/* SONG TITLE */}
                 <div className="text-start text-xs font-semibold grow" title={songUrls?.selected?.title}>
                    <p className="text-xs font-normal text-ellipsis whitespace-nowrap overflow-hidden max-w-30"><span className="font-semibold">{songUrls?.selected?.artist}</span> - {songUrls?.selected?.title}</p>
                </div>

                {/* PLAY ICON */}
                <span
                    onClick={(e)=>{e.stopPropagation(); playSong(songUrls?.selected?.previewUrl ?? '')}} 
                    className="clear-left rounded-full bg-[#eff0f9] h-6 w-6 cursor-pointer flex items-center justify-center group">
                    <span className="bg-white h-4 w-4 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M7 4v16l13 -8z" />
                        </svg>
                    </span>
                </span>

                {/* Edit Icon
                <Icon 
                    icon="mdi:edit-circle" height="20" width="20" 
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    className="absolute right-[-1.5rem] cursor-pointer text-gray-500 hover:text-blue-600" 
                    onClick={()=>{setShowSelector(!showSelector)}}
                    /> */}
            </div>
        ) : ( <div
                onClick={()=>{enabled && setShowSelector(!showSelector)}} 
                className={`glassy-bg ${enabled ? 'cursor-pointer' : 'cursor-default'} hover:bg-grayhover:text-white max-w-50  h-auto w-auto flex px-3 gap-3 justify-center items-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                <Icon 
                    icon="mdi:music" height="20" width="20" 
                    className="text-black" 
                    />
                <p className="text-ellipsis text-sm text-center self-center whitespace-nowrap overflow-hidden max-w-[200px]">Add Sound</p>
                
            </div>
        )
    }


  return (
    <>
        <div className="flex justify-center items-center w-full">
            {renderSelectedSong()}
        </div>
        {showSelector && <AudioSelector onClose={()=>{setShowSelector(false)}} songUrls={songUrls ?? { selected: null, lists: [] }} setSongUrls={setSongUrls} />}
        {/* delete icon */}
    </>
  )
}

export default AudioUpload