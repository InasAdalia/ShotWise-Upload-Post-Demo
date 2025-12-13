import { Icon } from '@iconify/react'
import axios from 'axios';
import React, { useEffect } from 'react'
import { songLists, type SongData } from '../data';
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
    songUrls: { selected: SongData | null, lists: SongData[]}
    setSongUrls: (songUrls: { selected: SongData | null, lists: SongData[]}) => void
    onClose: () => void
}

function AudioSelector({songUrls, setSongUrls, onClose}: AudioSelectorProps) {

    const [isLoading, setIsLoading] = React.useState(false);
    const [currentAudio, setCurrentAudio] = React.useState<HTMLAudioElement | null>(null); // Add this
    const [playingIndex, setPlayingIndex] = React.useState<number | null>(null); // Track which song is playing

    const fetchAllSongs = async () => {
        try {
            setIsLoading(true);

            // Check localStorage first
            const localState = localStorage.getItem('songData');
                
                if (localState) {
                    // If cached data exists, use it
                    const cachedData = JSON.parse(localState);
                    // console.log('cached song', cachedData);
                    // console.log('Using cached song data from localStorage');
                    setSongUrls({selected: cachedData.selected, lists: cachedData.lists});
                    setIsLoading(false);
                    return; // Exit early, no need to fetch
                }

                // If no cache, fetch from API
                console.log('Fetching songs from API');
                const response = await axios.post(
                    'http://localhost:8000/music/bulk-search',
                    songLists,
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                setIsLoading(false);
                // console.log(response.data);
                
                const newSongUrls = {
                    selected: songUrls.selected, // Preserve any existing selection
                    lists: response.data
                };
                
                setSongUrls(newSongUrls);
                
                // Save to localStorage
                localStorage.setItem('songData', JSON.stringify(newSongUrls));
                
        } catch (error) {
            console.error('Error fetching songs:', error);
            setIsLoading(false);
        }
    };

    const playSong = async (songUrl: string, index: number) => {
        if (!songUrl) return;
        
        // Stop previous audio if it exists
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        // If clicking the same song that's playing, stop it
        if (playingIndex === index) {
            setPlayingIndex(null);
            setCurrentAudio(null);
            return;
        }
        
        // Create and play new audio
        const audio = new Audio(`http://localhost:8000/music/proxy-preview?url=${encodeURIComponent(songUrl)}`);
        
        // Add event listener for when song ends
        audio.addEventListener('ended', () => {
            setPlayingIndex(null);
            setCurrentAudio(null);
        });
        
        audio.play();
        setCurrentAudio(audio);
        setPlayingIndex(index);
    };


    const handleSelectSong = (song: SongData) => {
        // Stop any playing audio when selecting a song
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setPlayingIndex(null);
        }
        onClose();
        setSongUrls({selected: song, lists: songUrls.lists});
        localStorage.setItem('songData', JSON.stringify({selected: song, lists: songUrls.lists}));
    }

    useEffect(() => {
            // Disable scroll
            const phoneWrapper = document.querySelector('.post-layout');
            phoneWrapper?.classList.remove('overflow-y-auto');
            phoneWrapper?.classList.add('overflow-hidden');
            // document.body.style.overflow = 'hidden';
            
            // Cleanup: Re-enable scroll when modal closes
            return () => {
                phoneWrapper?.classList.add('overflow-y-auto');
            };
    }, []);

    useEffect(() => {
        fetchAllSongs(); 
    }, []);

    const renderSongList= ()=>{
        if (!songUrls) return

        return songUrls.lists.map((song, idx) => (
            <div
                key={idx}
                onClick={()=>{
                    handleSelectSong(song);
                }}
                className={`${songUrls.selected?.title === song.title && 'selected'} cursor-pointer glassy-medium h-auto flex gap-1 items-center justify-space-between px-2 py-1 relative max-h-40 shadow-lg rounded-xl`}>
                {/* ALBUM COVER */}
                <img src={matchAlbumCovers(song?.title, idx)} 
                    className={`rounded-2xl h-8 ${playingIndex === idx ? 'animate-[spin_6s_linear_infinite]' : ''}`} />

                {/* SONG TITLE */}
                 <div className={`song-title mx-4 text-start text-sm grow`} style={{fontFamily:'Antic Didone', fontWeight: 900}} title={song.title}>
                    <p className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.title}</p>
                    <p className="text-xs font-normal text-ellipsis whitespace-nowrap overflow-hidden max-w-[200px]">{song.albumName}</p>
                </div>

                {/* PLAY ICON */}
                {songUrls.selected?.title === song.title? (
                    <Icon 
                        icon="mdi:trash-can-outline" height="18" width="18" 
                        className="text-gray-500 hover:text-rose-600 mr-2 cursor-pointer" />
                ) :<span
                    onClick={(e)=>{e.stopPropagation(); playSong(song.previewUrl ?? '', idx)}} 
                    className="clear-left rounded-full bg-[#eff0f9] h-10 w-10 cursor-pointer flex items-center justify-center group">
                    <span className="bg-white h-6 w-6 rounded-full shadow-md flex items-center justify-center group-hover:bg-rose-600">
                        {playingIndex === idx ? (
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
                </span>}
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
                    {isLoading? (
                        <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <p>
                            <Skeleton count={3} />
                            </p>
                        </SkeletonTheme>
                    )
                    : renderSongList()}
                </div>
                    
            </div>
        
        </div>
    </>
  )
}

export default AudioSelector