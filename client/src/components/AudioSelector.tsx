// File: client\src\components\AudioSelector.tsx
import { Icon } from '@iconify/react'
import React, { useEffect } from 'react'
import { songLists, type SongData } from '../data';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useSongManager } from '../SongContext';

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
    selectedSong: SongData | null;
    onSelectSong: (song: SongData | null) => void;
    onClose: () => void;
}

function AudioSelector({ selectedSong, onSelectSong, onClose }: AudioSelectorProps) {

    const { songs, stopSong, togglePlay, currentSong, isPlaying } = useSongManager();

    const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);

    // Sync playing index with current song from context
    useEffect(() => {
        if (currentSong && isPlaying) {
            const index = songs.findIndex(s => s.title === currentSong.title);
            setPlayingIndex(index !== -1 ? index : null);
        } else {
            setPlayingIndex(null);
        }
    }, [currentSong, isPlaying, songs]);


    const toggleSongSelection = (song: SongData) => {
        // Stop any playing audio when selecting a song

        if (selectedSong === song) {
            // The song is already selected, set onSelectSong to null
            onSelectSong(null);
            localStorage.removeItem('selectedSong');
        } else {
            // The song is not selected, set it as the selected song
            localStorage.setItem('selectedSong', JSON.stringify(song));
            onSelectSong(song);
            setPlayingIndex(null);
            onClose();
        }
        stopSong();
    };


    useEffect(() => {
        // Disable scroll
        const phoneWrapper = document.querySelector('.post-layout');
        phoneWrapper?.classList.remove('overflow-y-auto');
        phoneWrapper?.classList.add('overflow-hidden');
        
        // Cleanup: Re-enable scroll when modal closes
        return () => {
            phoneWrapper?.classList.add('overflow-y-auto');
            // Stop audio when closing
            stopSong();
        };
    }, []);

    const renderSongList = () => {
        if (!songs || songs.length === 0) {
            return (
                <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
                    <p>
                        <Skeleton count={5} height={60} />
                    </p>
                </SkeletonTheme>
            );
        }

        return songs.map((song, idx) => (
            <div
                key={idx}
                onClick={() => {
                    toggleSongSelection(song);
                }}
                className={`${(selectedSong?.title === song.title) && 'selected'} song-selection cursor-pointer glassy-medium h-auto flex gap-1 items-center justify-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                {/* ALBUM COVER */}
                <img src={matchAlbumCovers(song?.title, idx)} 
                    className={`rounded-2xl h-8 ${playingIndex === idx && isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />

                {/* SONG TITLE */}
                <div className={`song-title mx-4 text-start text-sm grow`} style={{fontFamily:'Antic Didone', fontWeight: 900}} title={song.title}>
                    <p className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.title}</p>
                    <p className="text-xs font-normal text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.albumName}</p>
                </div>

                {/* PLAY/DELETE ICON */}
                {selectedSong?.title === song.title ? (
                    <Icon 
                        icon="mdi:trash-can-outline" height="18" width="18"
                        onClick={(e) => { e.stopPropagation(); toggleSongSelection(song); }}
                        className="text-gray-500 hover:text-rose-600 mr-2 cursor-pointer" />
                ) : ( 
                    <span
                        onClick={(e) => {e.stopPropagation(); song && togglePlay(song); }} 
                        className="clear-left rounded-full bg-[#eff0f9] h-10 w-10 cursor-pointer flex items-center justify-center group">
                        <span className="bg-white h-6 w-6 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                                
                            { song === currentSong ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <rect x="6" y="5" width="4" height="14" rx="1" />
                                    <rect x="14" y="5" width="4" height="14" rx="1" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:fill-white group-hover:stroke-white" width="10" height="10" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#7e9cff" fill="#7e9cff" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M7 4v16l13 -8z" />
                                </svg>
                            )}
                        </span>
                    </span>
                    
                )}
            </div>
        ))
    }

    return (
        <>  
            {/* background blurrer */}
            <div className="fixed inset-x-0 -inset-y-20 z-0 h-[120vh] pointer-events-none" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}></div>
            
            {/* main component */}
            <div className="fixed h-[100%] top-52 left-0 right-0 flex justify-center">
                <div className="w-full max-w-[375px] min-h-[430px] z-999 bg-gray-100 shadow-xl rounded-t-2xl px-4 py-2 max-h-[60vh] flex flex-col items-center overflow-y-auto scrollbar-hide">
                    {/* header */}
                    <Icon 
                        icon={"mdi:chevron-down"} height="20" width="20" 
                        onClick={onClose}
                        className={'cursor-pointer'} 
                    />

                    <h2 className="text-sm text-start text-gray-600 self-start align-auto mb-4">Trending Songs</h2>
                    {/* audio list */}
                    <div className="flex flex-col gap-2 w-full">
                        {renderSongList()}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AudioSelector