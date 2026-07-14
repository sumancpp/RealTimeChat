import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, Share2 } from 'lucide-react';

const ChatReplay = ({ messages, currentUser, selectedUser, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const containerRef = useRef(null);
    
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    
    // Filter out system messages, game invites, and only keep messages from the last 48 hours
    const storyMessages = messages.filter(m => {
        const msgTime = new Date(m.createdAt || Date.now()).getTime();
        return !m.isSystemMessage && 
               !m.isDeleted && 
               m.message !== "@game" &&
               msgTime > fortyEightHoursAgo;
    });

    useEffect(() => {
        if (!isPlaying) return;
        
        if (currentIndex < storyMessages.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 1500); // 1.5 seconds per message
            return () => clearTimeout(timer);
        } else {
            setIsPlaying(false);
        }
    }, [currentIndex, isPlaying, storyMessages.length]);

    useEffect(() => {
        // Auto-scroll to bottom as new messages appear
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [currentIndex]);

    const handleShare = async () => {
        const title = `Chat Story with ${selectedUser?.isGroup ? selectedUser.groupName : (selectedUser?.name || selectedUser?.userName)}`;
        let text = `${title}\n\n`;
        
        storyMessages.forEach(msg => {
            const isMe = (msg.sender?._id || msg.sender)?.toString() === currentUser?._id?.toString();
            const senderName = isMe ? "Me" : (msg.sender?.name || msg.sender?.userName || "Them");
            if (msg.message) {
                text += `${senderName}: ${msg.message}\n`;
            } else if (msg.image) {
                text += `${senderName}: [Image]\n`;
            } else if (msg.voice) {
                text += `${senderName}: [Voice Message]\n`;
            }
        });
        
        text += "\nCreated via BaatCheet";

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            alert("Sharing is not supported on this browser. The story text has been copied to your clipboard!");
            navigator.clipboard.writeText(text);
        }
    };

    if (storyMessages.length === 0) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-4">
                <p className="text-xl mb-4">Not enough messages to create a story!</p>
                <button onClick={onClose} className="px-6 py-2 bg-white text-black rounded-full font-bold">Close</button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center p-6 text-white z-10">
                <div>
                    <h2 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">
                        Chat Story
                    </h2>
                    <p className="text-xs text-gray-400">with {selectedUser?.isGroup ? selectedUser.groupName : (selectedUser?.name || selectedUser?.userName)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleShare} className="p-2 hover:bg-white/10 text-orange-400 rounded-full transition" title="Share Story">
                        <Share2 size={24} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition" title="Close">
                        <X size={28} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div 
                ref={containerRef}
                className="flex-1 w-full max-w-md overflow-y-auto px-4 pb-32 scrollbar-hide flex flex-col gap-6 pt-10"
                style={{ scrollBehavior: 'smooth' }}
            >
                {storyMessages.slice(0, currentIndex).map((msg, idx) => {
                    const isMe = (msg.sender?._id || msg.sender)?.toString() === currentUser?._id?.toString();
                    
                    return (
                        <div 
                            key={msg._id || idx}
                            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500`}
                        >
                            <div className="flex flex-col max-w-[80%]">
                                {!isMe && selectedUser?.isGroup && (
                                    <span className="text-[10px] text-gray-400 ml-2 mb-1">
                                        {msg.sender?.name || msg.sender?.userName || "Someone"}
                                    </span>
                                )}
                                
                                <div 
                                    className={`p-4 rounded-3xl shadow-2xl ${
                                        isMe 
                                            ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-tr-sm' 
                                            : 'bg-white/10 text-white backdrop-blur-md rounded-tl-sm border border-white/10'
                                    }`}
                                    style={{
                                        boxShadow: isMe ? '0 10px 25px -5px rgba(249, 115, 22, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    {msg.image && (
                                        <img src={msg.image} alt="attachment" className="w-full max-w-[200px] rounded-xl mb-2 object-cover" />
                                    )}
                                    {msg.message && (
                                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                                            {msg.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 shadow-2xl">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className="text-white hover:text-orange-400 transition hover:scale-110"
                >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
                </button>
                
                <div className="w-px h-6 bg-white/20"></div>
                
                <button 
                    onClick={() => {
                        if (currentIndex < storyMessages.length) {
                            setCurrentIndex(prev => prev + 1);
                        }
                    }} 
                    className="text-white hover:text-orange-400 transition hover:scale-110"
                    disabled={currentIndex >= storyMessages.length}
                >
                    <SkipForward size={28} />
                </button>
            </div>
        </div>
    );
};

export default ChatReplay;
