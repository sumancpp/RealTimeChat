import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../config';
import { Plus, X, Eye, Send, Smile, ChevronUp, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import defaultProfile from '../assets/profile.png';
import { setSelectedUser } from '../redux/userSlice';

const BAATCHEET_GROUP_USER = {
    _id: 'baatcheet-official',
    name: 'Baatcheet',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=baatcheet&backgroundColor=10b981',
};

const BAATCHEET_GROUP = {
    user: BAATCHEET_GROUP_USER,
    statuses: [
        {
            _id: 'b1',
            createdAt: new Date().toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-blue-600 to-indigo-800',
            title: 'Search by Username',
            description: 'Easily find your friends by typing their unique username in the search bar! No need to share phone numbers.',
            icon: '🔍',
            instruction: 'Tap the search icon in the main menu and type any @username!',
            caption: 'Find friends easily!',
            viewers: []
        },
        {
            _id: 'b2',
            createdAt: new Date(Date.now() + 1000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-purple-600 to-fuchsia-800',
            title: 'Baatcheet AI',
            description: 'Chat with our smart AI assistant for instant answers, advice, and help!',
            icon: '🤖',
            instruction: 'Click the 🤖 icon at the bottom right corner of your chat list.',
            caption: 'Your personal AI assistant.',
            viewers: []
        },
        {
            _id: 'b3',
            createdAt: new Date(Date.now() + 2000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-green-600 to-teal-800',
            title: 'Group Chats',
            description: 'Create groups and bring all your friends together in one place for endless conversations.',
            icon: '👥',
            instruction: "Tap the '+' icon and select 'New Group' to add your friends.",
            caption: 'The more the merrier!',
            viewers: []
        },
        {
            _id: 'b4',
            createdAt: new Date(Date.now() + 3000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-orange-500 to-red-600',
            title: 'Voice & Video Calls',
            description: 'Connect face-to-face with crystal clear high-quality video and voice calls.',
            icon: '📞',
            instruction: 'Open any chat and tap the phone or camera icon at the top right.',
            caption: 'Crystal clear calls.',
            viewers: []
        },
        {
            _id: 'b5',
            createdAt: new Date(Date.now() + 4000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-indigo-500 to-purple-700',
            title: 'AI Mood Music',
            description: 'Automatically detects chat vibes and suggests playable YouTube Music cards.',
            icon: '🎵',
            instruction: "Click the Music (🎵) icon next to the chat input to type '@music' and hit send.",
            caption: 'Let the music play!',
            viewers: []
        },
        {
            _id: 'b6',
            createdAt: new Date(Date.now() + 5000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-pink-500 to-rose-700',
            title: 'AI Roast Mode',
            description: 'Instantly generate hilarious AI-powered burns to send to your friends.',
            icon: '🔥',
            instruction: "Click the Flame (🔥) icon next to the chat input to type '@roast' and hit send.",
            caption: 'Unleash the fun!',
            viewers: []
        },
        {
            _id: 'b7',
            createdAt: new Date(Date.now() + 6000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-yellow-500 to-orange-600',
            title: 'Chat Story Replay',
            description: 'Turn your last 48 hours of messages into a cinematic, animated playback.',
            icon: '⏪',
            instruction: "Open the 3-dot (⋮) menu in any 1-on-1 chat and select 'Play Chat Story'.",
            caption: 'Relive the memories!',
            viewers: []
        },
        {
            _id: 'b8',
            createdAt: new Date(Date.now() + 7000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-cyan-500 to-blue-700',
            title: 'Group Whiteboard',
            description: 'Collaborate in real-time with your friends using the shared group whiteboard.',
            icon: '🎨',
            instruction: 'In any group chat, tap the 🎨 icon to start drawing together.',
            caption: 'Get creative together!',
            viewers: []
        },
        {
            _id: 'b9',
            createdAt: new Date(Date.now() + 8000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-purple-600 to-indigo-900',
            title: 'Ghost Ink Mode',
            description: 'Send secret self-destructing messages that disintegrate 5s after reveal, displaying real-time "Ghost SMS is seen" status badge to both users.',
            icon: '👻',
            instruction: 'Open 3-dot (⋮) menu in chat → select Ghost Ink Mode, or type "@ghost your message".',
            caption: 'Self-destructing secret messages!',
            viewers: []
        },
        {
            _id: 'b10',
            createdAt: new Date(Date.now() + 9000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-amber-600 to-orange-700',
            title: 'Mini-Game Duel Hub',
            description: 'Challenge chat partners to 2-player Table Tennis 🏓, Tic-Tac-Toe ❌⭕, or Rock Paper Scissors ✊✋✌️ with real-time duel permission prompts.',
            icon: '⚔️',
            instruction: 'Open 3-dot (⋮) menu in chat → click "Play Mini-Game Duel" → select a game to send invite!',
            caption: 'Challenge your friends to a duel!',
            viewers: []
        },
        {
            _id: 'b11',
            createdAt: new Date(Date.now() + 10000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-slate-700 to-slate-900',
            title: 'Group Incognito Mode',
            description: 'Send anonymous messages in group chats masked as "Secret Member" with an incognito avatar.',
            icon: '🕶️',
            instruction: 'In group chat input bar, tap the Fedora Hat & Sunglasses icon to toggle Incognito Mode.',
            caption: 'Stay completely anonymous in groups!',
            viewers: []
        }
    ]
};


const StatusSection = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Upload state
    const fileInputRef = useRef(null);
    const pickerRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [caption, setCaption] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Viewer state
    const [activeGroup, setActiveGroup] = useState(null); // The user's statuses being viewed
    const [activeGroupIndex, setActiveGroupIndex] = useState(0); // Which status in the group
    const [statusViewTimer, setStatusViewTimer] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    
    // Reply state
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);
    const [showReplySheet, setShowReplySheet] = useState(false);
    const [showReplyEmoji, setShowReplyEmoji] = useState(false);

    const fetchStatuses = async () => {
        try {
            const res = await axios.get(`${serverUrl}/status`, { withCredentials: true });
            // Sort to have older statuses first for sequence
            if (Array.isArray(res.data)) {
                const sortedStatuses = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setStatuses(sortedStatuses);
            } else {
                setStatuses([]);
            }
        } catch (error) {
            console.log("Error fetching statuses", error);
        }
    };

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("caption", caption);

        setLoading(true);
        try {
            await axios.post(`${serverUrl}/status/upload`, formData, {
                withCredentials: true
            });
            fetchStatuses();
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption("");
        } catch (error) {
            console.log("Error uploading status", error);
        } finally {
            setLoading(false);
        }
    };

    const markStatusAsViewed = async (status) => {
        if (status.type === 'custom') return;
        if (status.user?._id !== userData?._id) {
            try {
                await axios.post(`${serverUrl}/status/view/${status._id}`, {}, { withCredentials: true });
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleViewStatusGroup = (group) => {
        setActiveGroup(group);
        setActiveGroupIndex(0);
        setStatusViewTimer(0);
        setShowViewers(false);
        setShowReplySheet(false);
        markStatusAsViewed(group.statuses[0]);
    };

    const nextStatus = () => {
        if (activeGroupIndex < activeGroup.statuses.length - 1) {
            setActiveGroupIndex(prev => prev + 1);
            setStatusViewTimer(0);
            setShowViewers(false);
            setShowReplySheet(false);
            markStatusAsViewed(activeGroup.statuses[activeGroupIndex + 1]);
        } else {
            setActiveGroup(null);
        }
    };

    const prevStatus = () => {
        if (activeGroupIndex > 0) {
            setActiveGroupIndex(prev => prev - 1);
            setStatusViewTimer(0);
            setShowViewers(false);
            setShowReplySheet(false);
            markStatusAsViewed(activeGroup.statuses[activeGroupIndex - 1]);
        }
    };

    useEffect(() => {
        let timer;
        if (activeGroup !== null && !showViewers && !showReplySheet) {
            timer = setInterval(() => {
                setStatusViewTimer(prev => {
                    if (prev >= 15) {
                        nextStatus();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [activeGroup, activeGroupIndex, showViewers, showReplySheet]);

    const handleReplySubmit = async (e) => {
        e.stopPropagation();
        if (!replyText.trim() || replying) return;
        setReplying(true);
        const formData = new FormData();
        formData.append("message", `*Replying to status:* \n${replyText}`);
        try {
            await axios.post(`${serverUrl}/message/send/${activeGroup.user._id}`, formData, {
                withCredentials: true
            });
            setReplyText("");
            setShowReplySheet(false);
            dispatch(setSelectedUser(activeGroup.user)); // Navigate to chat
            setActiveGroup(null); // Close status viewer
        } catch (error) {
            console.log("Reply error:", error);
        } finally {
            setReplying(false);
        }
    };

    const handleDeleteStatus = async (statusId) => {
        try {
            // Optimistic UI update for instant feedback
            setStatuses(prev => prev.filter(s => s._id !== statusId));
            
            const updatedGroup = { ...activeGroup, statuses: activeGroup.statuses.filter(s => s._id !== statusId) };
            if (updatedGroup.statuses.length === 0) {
                setActiveGroup(null);
            } else {
                setActiveGroup(updatedGroup);
                setActiveGroupIndex(prev => Math.max(0, prev - 1));
            }

            await axios.delete(`${serverUrl}/status/${statusId}`, { withCredentials: true });
            
        } catch (error) {
            console.error("Failed to delete status", error);
            alert("Failed to delete status.");
            fetchStatuses(); // Revert state if backend fails
        }
    };

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
        const userId = status.user?._id;
        if (!userId) return acc;
        if (!acc[userId]) {
            acc[userId] = { user: status.user, statuses: [] };
        }
        acc[userId].statuses.push(status);
        return acc;
    }, {});

    const myGroup = userData?._id ? groupedStatuses[userData._id] : undefined;
    
    // Filter out my group from recent updates
    const otherGroupsFromApi = Object.values(groupedStatuses).filter(group => group.user?._id !== userData?._id);
    const otherGroups = [BAATCHEET_GROUP, ...otherGroupsFromApi];
    
    // Get last status of group to show time
    const getLastStatusTime = (group) => {
        const lastStatus = group.statuses[group.statuses.length - 1];
        return new Date(lastStatus.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="w-full h-full flex flex-col p-4 overflow-y-auto bg-[#05070e] text-slate-100 scrollbar-hide">
            
            {/* My Status */}
            <div className="flex items-center gap-4 mb-6 relative cursor-pointer p-3 rounded-2xl glass-card border border-cyan-500/20 shadow-lg glass-card-hover">
                <div className="relative" onClick={() => myGroup ? handleViewStatusGroup(myGroup) : fileInputRef.current.click()}>
                    <div className={`p-[2px] rounded-full ${myGroup ? 'bg-gradient-to-tr from-cyan-400 to-fuchsia-500 p-[2px]' : ''}`}>
                        <img 
                            src={userData?.profileImage || defaultProfile} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#090d18] bg-[#090d18] shadow-md"
                            alt="My Status"
                        />
                    </div>
                    {!myGroup && (
                        <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1 border-2 border-[#090d18] text-white shadow-lg">
                            <Plus size={12} />
                        </div>
                    )}
                </div>
                <div className="flex-1" onClick={() => myGroup ? handleViewStatusGroup(myGroup) : fileInputRef.current.click()}>
                    <h3 className="font-bold text-sm text-white">My Status</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {myGroup ? getLastStatusTime(myGroup) : "Tap to add status update"}
                    </p>
                </div>
                {myGroup && (
                    <button onClick={() => fileInputRef.current.click()} className="p-2.5 rounded-xl bg-[#090d18] border border-cyan-500/20 text-cyan-400 hover:text-white transition">
                        <Plus size={18} />
                    </button>
                )}
                <input 
                    type="file" 
                    id="status-file-input"
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                />
            </div>

            {/* Recent Updates */}
            {otherGroups.length > 0 && <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Recent updates</h3>}
            <div className="flex flex-col gap-2">
                {Array.isArray(otherGroups) && otherGroups.map((group) => (
                    <div 
                        key={group.user._id} 
                        className="flex items-center gap-3.5 cursor-pointer p-3 rounded-2xl glass-card border border-cyan-500/15 shadow-md glass-card-hover"
                        onClick={() => handleViewStatusGroup(group)}
                    >
                        <div className="p-[2px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500 rounded-full">
                            <img 
                                src={group.user.profileImage || defaultProfile} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#090d18] bg-[#090d18] shadow-sm"
                                alt="Status"
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white">{group.user.name || group.user.userName}</h4>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {getLastStatusTime(group)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Preview Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                    >
                        <div className="flex justify-between p-4 text-white bg-black/50 absolute top-0 w-full z-10">
                            <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); setCaption(""); }} className="p-2 bg-gray-800/80 rounded-full"><X size={24} /></button>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-0 bg-black overflow-hidden min-h-0 relative">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                        </div>
                        <div className="p-4 pb-8 sm:pb-4 pr-6 sm:pr-4 bg-gray-900 flex flex-col gap-3 shrink-0 relative w-full box-border">
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-4 mb-2 z-50" ref={pickerRef}>
                                    <EmojiPicker 
                                        onEmojiClick={(emojiData) => setCaption(prev => prev + emojiData.emoji)}
                                        theme="dark"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-gray-400 hover:text-white p-2"
                                >
                                    <Smile size={24} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Add a caption..." 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="flex-1 min-w-0 bg-gray-800 text-white p-3 rounded-full outline-none"
                                />
                                <button 
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="bg-green-500 w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-green-600 disabled:opacity-50 flex-shrink-0 shadow-lg active:scale-95 transition-transform"
                                >
                                    {loading ? <span className="animate-pulse">...</span> : <Send size={20} className="ml-1" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Viewer Modal */}
            <AnimatePresence>
                {activeGroup && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                    >
                        {/* Progress bars segment */}
                        <div className="flex w-full gap-1 p-2 absolute top-0 z-10">
                            {Array.isArray(activeGroup.statuses) && activeGroup.statuses.map((_, idx) => (
                                <div key={idx} className="h-1 flex-1 bg-gray-500/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white transition-all duration-1000 ease-linear" 
                                        style={{ 
                                            width: idx < activeGroupIndex ? '100%' : idx === activeGroupIndex ? `${(statusViewTimer / 15) * 100}%` : '0%' 
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 mt-4 z-30 absolute top-2 w-full bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
                            <div className="flex items-center gap-3">
                                <img src={activeGroup.user.profileImage || defaultProfile} className="w-10 h-10 rounded-full border border-gray-400" alt="User" />
                                <div className="text-white drop-shadow-md">
                                    <h4 className="font-semibold text-shadow">{activeGroup.user.name || activeGroup.user.userName}</h4>
                                    <p className="text-xs text-gray-200">{new Date(activeGroup.statuses[activeGroupIndex].createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveGroup(null)} className="text-white p-2 rounded-full hover:bg-gray-700/50">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Image & Navigation Areas */}
                        <div className="flex-1 relative flex flex-col justify-center bg-black overflow-hidden min-h-0">
                            {/* Left tap area for previous */}
                            <div className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" onClick={prevStatus}></div>
                            {/* Right tap area for next */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" onClick={nextStatus}></div>
                            
                            <div className="w-full h-full flex items-center justify-center p-0">
                                {activeGroup.statuses[activeGroupIndex].type === 'custom' ? (
                                    <div className={`w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br ${activeGroup.statuses[activeGroupIndex].bgColor}`}>
                                        <motion.div 
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            key={`icon-${activeGroupIndex}`}
                                            className="relative mb-8"
                                        >
                                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
                                            <div className="text-8xl drop-shadow-2xl relative z-10">
                                                {activeGroup.statuses[activeGroupIndex].icon}
                                            </div>
                                        </motion.div>
                                        <motion.h2 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            key={`title-${activeGroupIndex}`}
                                            className="text-3xl md:text-4xl font-extrabold text-white text-center mb-6 drop-shadow-md"
                                        >
                                            {activeGroup.statuses[activeGroupIndex].title}
                                        </motion.h2>
                                        <motion.p 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            key={`desc-${activeGroupIndex}`}
                                            className="text-lg md:text-xl text-white/95 text-center font-medium drop-shadow-sm leading-relaxed"
                                        >
                                            {activeGroup.statuses[activeGroupIndex].description}
                                        </motion.p>
                                        {activeGroup.statuses[activeGroupIndex].instruction && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                key={`inst-${activeGroupIndex}`}
                                                className="mt-8 bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 max-w-sm shadow-xl w-full"
                                            >
                                                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-2">
                                                    <span>💡</span> How to use
                                                </div>
                                                <p className="text-white text-sm md:text-base text-center font-medium">
                                                    {activeGroup.statuses[activeGroupIndex].instruction}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <img src={activeGroup.statuses[activeGroupIndex].image} className="w-full h-full object-contain" alt="Status Content" />
                                )}
                            </div>

                            {/* Caption */}
                            {activeGroup.statuses[activeGroupIndex].caption && (
                                <div className="absolute bottom-24 w-full p-4 text-center z-10 pointer-events-none">
                                    <div className="inline-block bg-black/60 text-white px-4 py-2 rounded-xl backdrop-blur-sm mx-auto pointer-events-auto">
                                        {activeGroup.statuses[activeGroupIndex].caption}
                                    </div>
                                </div>
                            )}

                            {/* Reply Button Trigger (Only if someone else's status) */}
                            {activeGroup.user?._id !== userData?._id && activeGroup.user?._id !== 'baatcheet-official' && !showReplySheet && (
                                <div 
                                    className="absolute bottom-4 w-full flex flex-col items-center justify-center text-white z-30 cursor-pointer drop-shadow-lg"
                                    onClick={(e) => { e.stopPropagation(); setShowReplySheet(true); }}
                                >
                                    <ChevronUp size={28} className="animate-bounce" />
                                    <span className="text-sm font-semibold tracking-wide">Reply</span>
                                </div>
                            )}

                            {/* Reply Sheet */}
                            {activeGroup.user?._id !== userData?._id && activeGroup.user?._id !== 'baatcheet-official' && showReplySheet && (
                                <motion.div 
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    className="absolute bottom-0 w-full bg-gray-900 p-4 z-40 rounded-t-3xl shadow-2xl flex flex-col gap-3 pb-10 pr-6 sm:pb-6 sm:pr-4 box-border"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        <span className="text-white font-semibold">Reply to {activeGroup.user.name || activeGroup.user.userName}</span>
                                        <button onClick={() => setShowReplySheet(false)} className="text-gray-400 p-1 bg-gray-800 rounded-full hover:bg-gray-700"><X size={20}/></button>
                                    </div>
                                    
                                    <div className="relative flex items-center gap-2">
                                        {showReplyEmoji && (
                                            <div className="absolute bottom-full left-0 mb-2 z-50">
                                                <EmojiPicker 
                                                    onEmojiClick={(emojiData) => setReplyText(prev => prev + emojiData.emoji)}
                                                    theme="dark"
                                                />
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setShowReplyEmoji(!showReplyEmoji)}
                                            className="text-gray-400 hover:text-white p-2"
                                        >
                                            <Smile size={24} />
                                        </button>
                                        <input 
                                            type="text" 
                                            placeholder="Type a reply..." 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="flex-1 min-w-0 bg-gray-800 text-white placeholder-gray-400 p-3 rounded-full outline-none focus:ring-2 focus:ring-green-500"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={handleReplySubmit}
                                            disabled={replying || !replyText.trim()}
                                            className="bg-green-500 w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-green-600 disabled:opacity-50 flex-shrink-0 shadow-lg active:scale-95 transition-transform"
                                        >
                                            {replying ? <span className="animate-pulse">...</span> : <Send size={20} className="ml-1" />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Viewers (Only if own status) */}
                        {activeGroup.user?._id === userData?._id && (
                            <div className="relative z-30">
                                {showViewers && (
                                    <motion.div 
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-full left-0 right-0 bg-white rounded-t-3xl p-6 text-black min-h-[300px]"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">Viewed by {activeGroup.statuses[activeGroupIndex].viewers.length}</h3>
                                            <button onClick={() => setShowViewers(false)}><X size={20} /></button>
                                        </div>
                                        <div className="flex flex-col gap-2 mb-4">
                                            {Array.isArray(activeGroup.statuses[activeGroupIndex].viewers) && activeGroup.statuses[activeGroupIndex].viewers.map((viewer, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <img src={viewer.user.profileImage || defaultProfile} className="w-10 h-10 rounded-full" alt="Viewer" />
                                                    <div>
                                                        <h4 className="font-semibold">{viewer.user.name || viewer.user.userName}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(viewer.viewedAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {activeGroup.statuses[activeGroupIndex].viewers.length === 0 && (
                                                <p className="text-gray-500 text-center mt-4">No views yet</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                <div className="flex bg-gray-900 text-white">
                                    <div 
                                        className="p-4 flex-1 flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-800"
                                        onClick={() => setShowViewers(!showViewers)}
                                    >
                                        <Eye size={20} />
                                        <span>{activeGroup.statuses[activeGroupIndex].viewers.length} Viewers</span>
                                    </div>
                                    <div 
                                        className="p-4 flex justify-center items-center cursor-pointer hover:bg-red-500 hover:text-white text-red-400 transition-colors border-l border-gray-700"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteStatus(activeGroup.statuses[activeGroupIndex]._id); }}
                                    >
                                        <Trash2 size={20} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusSection;
