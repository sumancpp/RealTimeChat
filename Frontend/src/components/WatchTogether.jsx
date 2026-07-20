import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { getSocket } from '../socket';
import { X, Play, Pause, Maximize2 } from 'lucide-react';

const WatchTogether = ({ url, isHost, opponentId, isGroup, onClose }) => {
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    
    const playerRef = useRef(null);
    const socket = getSocket();

    // Prevent infinite loops of sync events
    const lastEmitTime = useRef(0);
    const lastSyncState = useRef({ playing: true, time: 0 });

    useEffect(() => {
        if (!socket) return;

        const handleSync = ({ state, from }) => {
            // If we are currently dragging the seek bar, ignore external syncs
            if (seeking) return;
            
            // Only accept syncs if the state significantly changed
            const timeDiff = Math.abs(state.time - (playerRef.current?.getCurrentTime() || 0));
            
            if (state.playing !== playing) {
                setPlaying(state.playing);
            }
            
            if (timeDiff > 1.5) { // Only seek if out of sync by > 1.5s
                playerRef.current?.seekTo(state.time, 'seconds');
            }
            
            lastSyncState.current = state;
        };

        const handleStop = () => {
            onClose();
        };

        socket.on("syncVideoState", handleSync);
        socket.on("stopWatchTogether", handleStop);

        return () => {
            socket.off("syncVideoState", handleSync);
            socket.off("stopWatchTogether", handleStop);
        };
    }, [socket, playing, seeking, onClose]);

    const emitSyncState = (newPlaying, newTime) => {
        // Debounce to prevent flooding
        const now = Date.now();
        if (now - lastEmitTime.current < 500) return;
        
        lastEmitTime.current = now;
        
        socket.emit("syncVideoState", { 
            to: opponentId, 
            state: { playing: newPlaying, time: newTime },
            isGroup 
        });
    };

    const handlePlay = () => {
        if (!playing) {
            setPlaying(true);
            emitSyncState(true, playerRef.current?.getCurrentTime() || 0);
        }
    };

    const handlePause = () => {
        if (playing) {
            setPlaying(false);
            emitSyncState(false, playerRef.current?.getCurrentTime() || 0);
        }
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        const newTime = parseFloat(e.target.value) * (playerRef.current?.getDuration() || 0);
        playerRef.current?.seekTo(newTime, 'seconds');
        emitSyncState(playing, newTime);
    };

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
        }
        
        // Host occasionally broadcasts sync to keep everyone perfectly aligned
        if (isHost && playing) {
            const now = Date.now();
            if (now - lastEmitTime.current > 3000) { // Every 3 seconds
                emitSyncState(true, playerRef.current?.getCurrentTime() || 0);
            }
        }
    };

    const handleClose = () => {
        socket.emit("stopWatchTogether", { to: opponentId, isGroup });
        onClose();
    };

    return (
        <div className="w-full bg-black/95 border-b border-gray-800 p-2 sm:p-4 shrink-0 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-center w-full max-w-3xl mb-2 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-200">Sync Cinema</h3>
                    <span className="text-xs text-gray-500 hidden sm:inline ml-2">Watch Together</span>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                    <X size={16} className="text-gray-300" />
                </button>
            </div>
            
            <div className="w-full max-w-3xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                {/* The Player */}
                <ReactPlayer 
                    ref={playerRef}
                    url={url} 
                    width="100%" 
                    height="100%"
                    playing={playing}
                    controls={false} // Custom controls so we can sync them easily
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onProgress={handleProgress}
                    onBuffer={() => emitSyncState(false, playerRef.current?.getCurrentTime() || 0)} // Pause for others if one person buffers
                    onBufferEnd={() => emitSyncState(true, playerRef.current?.getCurrentTime() || 0)}
                    config={{
                        youtube: {
                            playerVars: { 
                                disablekb: 1, 
                                modestbranding: 1,
                                rel: 0,
                                iv_load_policy: 3
                            }
                        }
                    }}
                />
                
                {/* Custom Sync Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        onTouchStart={handleSeekMouseDown}
                        onTouchEnd={handleSeekMouseUp}
                        className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-3 accent-red-500"
                    />
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={playing ? handlePause : handlePlay}
                            className="text-white hover:text-red-400 transition-colors"
                        >
                            {playing ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <div className="text-xs text-white/50 bg-black/40 px-2 py-1 rounded-md">
                            Synced via Baatcheet
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchTogether;
