import { Icon } from '@iconify/react';
import { useSongManager } from '../context/SongContext';
import type { PostData } from '../data'
import { matchAlbumCovers } from './AudioSelector';

interface PostProps {
    isLoading: boolean,
    post: PostData | null
    keyIndex: number | string
}
function Post({isLoading, post, keyIndex}: PostProps) {

    const { togglePlay, stopSong, isPlaybackEnabled, setIsPlaybackEnabled } = useSongManager();

    const handleTogglePlayback = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaybackEnabled(!isPlaybackEnabled);
    };

    const randomHeight = () =>{
        const values = [250, 275, 300, 325];
        return `${values[Math.floor(Math.random() * values.length)]}px`;
        // Generate a random height for loading skeletons
    }

    return (
    <>
        {isLoading || !post ? (
            //render loading skeleton
            <>
                <div
                    key={keyIndex}
                    className="w-full rounded-lg skeleton-box"
                    style={{
                        minHeight: '200px',
                        maxHeight: '325px', 
                        height: randomHeight() 
                    }}
                />
            </>
        ):(

            // render post
            <div
                key={`${post.owner}-${keyIndex}`}
                className="relative group cursor-pointer"
                onMouseEnter={() => {
                    if (post.song && isPlaybackEnabled) {
                        togglePlay(post.song);
                    }
                }}
                onMouseLeave={() => {
                    stopSong();
                }}
                onClick={(e)=>{
                    handleTogglePlayback(e);
                    if (post.song && isPlaybackEnabled) {
                        togglePlay(post.song);
                    }
                }}
            >
                {/* post image */}
                <img
                    className="block w-full h-auto rounded-lg object-cover"
                    src={post.image.storedUrl ?? post.image.localUrl}
                    alt="gallery-photo"
                />

                {/* overlay group */}
                <div
                    className="
                    pointer-events-none
                    absolute inset-0
                    rounded-lg
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity duration-300
                    bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent_20%),linear-gradient(to_top,rgba(0,0,0,0.7),transparent_40%)]
                    "
                />

                {/* music icon on/off */}
                <span className="group-hover:opacity-100 opacity-0 absolute top-2 left-0 text-xs text-white px-2 py-0.5 rounded">
                    {isPlaybackEnabled ? (
                        <Icon icon="fluent:music-note-2-20-filled" width="16" height="16" />
                    ) : (
                        <Icon icon="fluent:music-note-off-2-20-filled" width="16" height="16" />
                    )}
                </span>

                {/* username of post owner */}
                <p className="group-hover:opacity-100 opacity-0 absolute bottom-2 left-2 text-white text-sm max-w-60 truncate ellipsis">
                    @{post.owner}
                </p>

                {/* song album cover */}
                {post.song && (
                    <img 
                        src={matchAlbumCovers(post.song?.title, 0)}
                        alt="album cover" 
                        className="group-hover:opacity-100 opacity-0 absolute bottom-2 right-2 rounded-2xl h-5 w-5 border-1 border-white"
                    />
                )}
            </div>
        )}

        </>
    )
}

export default Post