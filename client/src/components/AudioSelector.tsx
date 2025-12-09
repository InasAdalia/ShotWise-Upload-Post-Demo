import { Icon } from '@iconify/react'
import axios from 'axios';
import React, { use, useEffect } from 'react'
import { songLists, type SongMeta } from '../data';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';


export const matchAlbumCovers = (songTitle: string, index: number) : string =>{

    const title = songLists.find(song =>
        songTitle.toLowerCase().trim().includes(song.title.toLowerCase().trim())
    );

    if (!title) {
        console.log("No match found for:", songTitle);
        return `public/album-covers/random${index}.jpg`;
    }

    return `public/album-covers/${title.title.toLowerCase()}.jpg`;
}

interface AudioSelectorProps {
    songUrls: { selected: SongMeta | null, lists: SongMeta[]}
    setSongUrls: (songUrls: { selected: SongMeta | null, lists: SongMeta[]}) => void
    onClose: () => void
}

function AudioSelector({songUrls, setSongUrls, onClose}: AudioSelectorProps) {

    const [isLoading, setIsLoading] = React.useState(false);
    const [curPlay, setCurPlay] = React.useState(0);

    const fetchAllSongs = async () => {
        try {
    
            setIsLoading(true)
            console.log('fetching');
            const response = await axios.post(
                'http://localhost:8000/music/bulk-search',
                songLists,
                { headers: { 'Content-Type': 'application/json' } }
            );
            // response.data is an array of spotifyPreviewFinder results
            setIsLoading(false)
            console.log(response);
            setSongUrls({selected: null, lists: response.data});
            
        } catch (error) {
            
        }
        // store in state and pass into AudioSelector
    };

    const playSong = async (songUrl: string) => {
        if (!songUrl) return;
        const audio = new Audio(`http://localhost:8000/music/proxy-preview?url=${encodeURIComponent(songUrl)}`);
        audio.play();
    };

    useEffect(() => {
        if (songUrls.lists.length > 0) return
        else fetchAllSongs();
    }, []);

    useEffect(()=>{console.log(songUrls)}, [songUrls])

    const renderSongList= ()=>{
        if (!songUrls) return

        return songUrls.lists.map((song, idx) => (
            <div
                key={idx}
                onClick={()=>{
                    setSongUrls({selected: song, lists: songUrls.lists});
                    onClose();
                }}
                className="bg-gray-100 h-auto flex gap-1 justify-start items-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl">
                {/* ALBUM COVER */}
                <img src={matchAlbumCovers(song.title, idx)} 
                    className="rounded-2xl h-8 " />

                {/* SONG TITLE */}
                 <div className="text-start text-xs font-semibold grow" title={song.title}>
                    <p className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.title}</p>
                    <p className="text-xs font-normal text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.albumName}</p>
                </div>

                {/* PLAY ICON */}
                <span
                    onClick={()=>{playSong(song.previewUrl ?? '')}} 
                    className="clear-left rounded-full bg-[#eff0f9] h-10 w-10 cursor-pointer flex items-center justify-center group">
                <span className="bg-white h-6 w-6 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 4v16l13 -8z" />
                    </svg>
                </span>
                </span>
            </div>
        ))
    }

  return (
    <>  
        {/* background blurrer */}
        <div className="fixed inset-0 z-40" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}></div>
        
        {/* main component */}
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center ">
        <div className="w-full max-w-[375px] min-h-[420px] bg-gray-300 shadow-xl rounded-t-2xl p-4 max-h-[60vh] flex flex-col items-center overflow-y-auto scrollbar-hide">
            {/* header */}
            <div
                onClick={()=>{onClose()}} 
                className="w-[50%] mb-5 h-1 bg-gray-400 rounded-full align-self-center cursor-pointer"></div>

            <h2 className="text-sm text-start self-start align-auto font-semibold mb-4">Trending Songs</h2>
            {/* audio list */}
            <div className="flex flex-col gap-2 w-full">
                {isLoading? (
                    <SkeletonTheme baseColor="#202020" highlightColor="#444">
                        <p>
                        <Skeleton count={3} />
                        </p>
                    </SkeletonTheme>
                )
                :renderSongList()}
            </div>
                
        </div>
        
        </div>
    </>
  )
}

export default AudioSelector