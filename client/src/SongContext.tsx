// File: client/src/SongManager.tsx
import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { songLists, type SongData } from './data';
import axios from 'axios';
import { useLoading } from './LoadingContext';

interface SongManagerContextType {
    currentSong: SongData | null;
    isPlaying: boolean;
    isPlaybackEnabled: boolean;
    playSong: (song: SongData) => Promise<void>;
    stopSong: () => void;
    togglePlaybackEnabled: () => void;
    songs: SongData[];
    loadSongs: () => Promise<void>;
}

const SongManagerContext = createContext<SongManagerContextType | undefined>(undefined);

interface SongManagerProviderProps {
    children: ReactNode;
}

export function SongManagerProvider({ children }: SongManagerProviderProps) {
    const [songs, setSongs] = useState<SongData[]>([]);
    const [currentSong, setCurrentSong] = useState<SongData | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(false);
    const { setIsLoading } = useLoading();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isPlaybackEnabledRef = useRef(isPlaybackEnabled);

    useEffect(() => {
        isPlaybackEnabledRef.current = isPlaybackEnabled;
    }, [isPlaybackEnabled]);

    // Load songs on mount
    useEffect(() => {
        loadSongs();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSong();
        };
    }, []);

    const loadSongs = async () => {
        try {
            // Check localStorage first
            const storedData = localStorage.getItem('songData');
            
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // console.log('parsed', parsed);
                setSongs(parsed || []);
                return;
            }

            // If not in localStorage, fetch from API
            console.log('Fetching songs from API...');
            // Replace with your actual API endpoint
            try {
                
                setIsLoading(true);
                const response = await axios.post(
                    'http://localhost:8000/music/bulk-search',
                    songLists,
                    { headers: { 'Content-Type': 'application/json' } }
                );    
                
                const songData = response.data; 
                setSongs(songData.lists || []);
                localStorage.setItem('songData', JSON.stringify(songData));
                // console.log('Songs loaded from API:', songData);
                setIsLoading(false);
            } catch (error) {
                
            }
        } catch (error) {
            console.error('Error loading songs:', error);
            setSongs([]);
        }
    };

    const stopSong = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentSong(null);
    };

    const playSong = async (song: SongData) => {
        if (!song.previewUrl || !isPlaybackEnabledRef.current) {
            return;
        }

        // Stop current audio
        // stopSong();

        const audio = new Audio(
            `http://localhost:8000/music/proxy-preview?url=${encodeURIComponent(song.previewUrl)}`
        );

        audioRef.current = audio;
        setCurrentSong(song);

        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentSong(null);
            audioRef.current = null;
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            setIsPlaying(false);
            setCurrentSong(null);
            audioRef.current = null;
        });

        try {
            console.log('playing audio');
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('Failed to play audio:', error);
            setIsPlaying(false);
            setCurrentSong(null);
            audioRef.current = null;
        }
    };

    const togglePlaybackEnabled = () => {
        setIsPlaybackEnabled(prev => {
            const next = !prev;
            
            // If turning off, stop current playback
            if (!next) {
                console.log('turning off')
                stopSong();
            }
            
            return next;
        });
    };

    const value: SongManagerContextType = {
        currentSong,
        isPlaying,
        isPlaybackEnabled,
        playSong,
        stopSong,
        togglePlaybackEnabled,
        songs,
        loadSongs,
    };

    return (
        <SongManagerContext.Provider value={value}>
            {children}
        </SongManagerContext.Provider>
    );
}

// Custom hook to use the SongManager
export function useSongManager() {
    const context = useContext(SongManagerContext);
    if (!context) {
        throw new Error('useSongManager must be used within SongManagerProvider');
    }
    return context;
}

// Utility function to get a random song from the list
export function getRandomSong(songs: SongData[]): SongData | null {
    if (!songs || songs.length === 0) return null;
    return songs[Math.floor(Math.random() * songs.length)];
}