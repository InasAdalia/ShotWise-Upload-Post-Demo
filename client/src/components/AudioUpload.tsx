// File: client\src\components\AudioUpload.tsx
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import AudioSelector, { matchAlbumCovers } from './AudioSelector';
import type { SongData } from '../data';
import { useLocation } from 'react-router-dom';
import { useSongManager } from '../context/SongContext';

interface AudioUploadProps {
    enabled: boolean;
    selectedSong: SongData | null;
    onSelectSong: (song: SongData | null) => void;
}

function AudioUpload({ selectedSong, onSelectSong, enabled }: AudioUploadProps) {

    const [showSelector, setShowSelector] = useState(false);
    const { togglePlay, stopSong, currentSong, isPlaying } = useSongManager();
    
    // Track if the currently playing song is THIS component's selected song
    const isThisSongPlaying = currentSong?.title === selectedSong?.title && isPlaying;

    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== '/upload') {
            stopSong();
        }
    }, [location.pathname]);

    // re-render/update UI when selected song changes
    useEffect(() => {}, [selectedSong]);

    const renderSelectedSong = () => {
        return selectedSong ? (

            // if song selected display selected song
            <div
                onClick={() => { setShowSelector(!showSelector) }}
                className={`glassy-bg cursor-pointer hover:bg-gray hover:text-white h-[fit-content] w-auto max-w-50 flex gap-1 justify-center items-center px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                
                {/* ALBUM COVER */}
                <img 
                    src={matchAlbumCovers(selectedSong?.title ?? '/assets/album-covers/random1', 0)}
                    alt="album cover" 
                    className={`rounded-2xl h-6 ${isThisSongPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} 
                />

                {/* SONG TITLE */}
                <div className="text-start text-xs font-semibold grow" title={selectedSong?.title}>
                    <p className="text-xs font-normal text-ellipsis whitespace-nowrap overflow-hidden max-w-30">
                        <span className="font-semibold">{selectedSong?.artist}</span> - {selectedSong?.title}
                    </p>
                </div>

                {/* PLAY ICON */}
                <span
                    onClick={(e) => { e.stopPropagation(); togglePlay(selectedSong); }} 
                    className="clear-left rounded-full bg-[#eff0f9] h-6 w-6 cursor-pointer flex items-center justify-center group">
                    <span className="bg-white h-4 w-4 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                        {isThisSongPlaying ? (
                            // Pause icon when playing
                            <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        ) : (
                            // Play icon when not playing
                            <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M7 4v16l13 -8z" />
                            </svg>
                        )}
                    </span>
                </span>
            </div>
        ) : (

            // if no song selected display button as '🎵 Add sound'
            <div
                onClick={() => { enabled && setShowSelector(!showSelector) }} 
                className={`glassy-bg ${enabled ? 'cursor-pointer' : 'cursor-default text-gray-500'} max-w-50 h-auto w-auto flex px-3 gap-3 justify-center items-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                <Icon 
                    icon="mdi:music" height="20" width="20" 
                />
                <p className="text-ellipsis text-sm text-center self-center whitespace-nowrap overflow-hidden max-w-[200px]">
                    Add Sound
                </p>
            </div>
        )
    }

    return (
        <>  
            {/* one song choice displayed at header */}
            <div className="flex justify-center items-center w-full">
                {renderSelectedSong()}
            </div>

            {/* song selection modal popping up from bottom of screen */}
            {showSelector && (
                <AudioSelector 
                    onClose={() => { setShowSelector(false) }} 
                    selectedSong={selectedSong}
                    onSelectSong={onSelectSong}
                />
            )}
        </>
    )
}

export default AudioUpload