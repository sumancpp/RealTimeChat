import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../config';
import { Plus, X, Eye, Send, Smile, ChevronUp, Trash2, Sparkles, UploadCloud, Loader2 } from 'lucide-react';
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
            title: 'Baatcheet AI Hub',
            description: 'Access AI Summary, Language Translator, Code Reviewer, Voice Transcriber & Sentiment Meter!',
            icon: '🤖',
            instruction: 'Open 3-dot (⋮) menu in chat → click "🤖 AI Features Hub".',
            caption: 'Supercharge chats with AI!',
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
            description: 'Send secret self-destructing messages that disintegrate 5s after reveal, displaying real-time "Ghost SMS is seen" status badge.',
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
            description: 'Challenge chat partners to 2-player Table Tennis 🏓, Tic-Tac-Toe ❌⭕, or Rock Paper Scissors ✊✋✌️ with real-time invitations.',
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
        },
        {
            _id: 'b12',
            createdAt: new Date(Date.now() + 11000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-rose-600 to-red-800',
            title: 'View-Once Media Disappear',
            description: 'Send photos or videos that can only be opened once by the recipient before self-destructing forever.',
            icon: '👁️',
            instruction: 'Select a photo in chat → tap the ① icon before sending to make it View-Once!',
            caption: 'Private 1-time view media!',
            viewers: []
        },
        {
            _id: 'b13',
            createdAt: new Date(Date.now() + 12000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-teal-600 to-emerald-800',
            title: 'Voice Pitch Shifter Notes',
            description: 'Record voice notes with pitch modification effects like Robot 🤖, Chipmunk 🐿️, and Deep Male 🎙️.',
            icon: '🎙️',
            instruction: 'Hold the microphone icon to record → select a voice pitch filter before sending!',
            caption: 'Disguise your voice with fun effects!',
            viewers: []
        },
        {
            _id: 'b14',
            createdAt: new Date(Date.now() + 13000).toISOString(),
            type: 'custom',
            user: BAATCHEET_GROUP_USER,
            bgColor: 'from-violet-600 to-fuchsia-900',
            title: 'AI Chat Vibe Meter',
            description: 'Analyzes conversation tone and displays a live vibe score (Positive/Neutral/Spicy) with mood insights.',
            icon: '📊',
            instruction: 'Open 3-dot (⋮) menu in chat → click AI Features Hub → select AI Vibe Meter.',
            caption: 'Track your chat sentiment live!',
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
    const [activeGroup, setActiveGroup] = useState(null);
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
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
            if (Array.isArray(res.data)) {
                const sortedStatuses = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setStatuses(sortedStatuses);
            } else {
                setStatuses([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    const MAX_STATUS_SIZE_MB = 10;
    const MAX_STATUS_SIZE_BYTES = MAX_STATUS_SIZE_MB * 1024 * 1024;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_STATUS_SIZE_BYTES) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
                alert(`Your image size (${fileSizeMB} MB) is too big! Please upload an image under ${MAX_STATUS_SIZE_MB} MB.`);
                if (e.target) e.target.value = "";
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadStatus = async () => {
        if (!selectedFile) return;

        if (selectedFile.size > MAX_STATUS_SIZE_BYTES) {
            const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
            alert(`Your image size (${fileSizeMB} MB) is too big! Please upload an image under ${MAX_STATUS_SIZE_MB} MB.`);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('media', selectedFile);
        formData.append('caption', caption);

        try {
            await axios.post(`${serverUrl}/status/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption("");
            fetchStatuses();
        } catch (error) {
            console.log(error);
            const serverMsg = error.response?.data?.message || "Error uploading status";
            alert(serverMsg);
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
            dispatch(setSelectedUser(activeGroup.user));
            setActiveGroup(null);
        } catch (error) {
            console.log("Reply error:", error);
        } finally {
            setReplying(false);
        }
    };

    const handleDeleteStatus = async (statusId) => {
        try {
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
            fetchStatuses();
        }
    };

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
    const otherGroupsFromApi = Object.values(groupedStatuses).filter(group => group.user?._id !== userData?._id);
    const otherGroups = [BAATCHEET_GROUP, ...otherGroupsFromApi];
    
    const getLastStatusTime = (group) => {
        const lastStatus = group.statuses[group.statuses.length - 1];
        return new Date(lastStatus.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="w-full h-full flex flex-col p-4 overflow-y-auto bg-[#05070e] text-slate-100 scrollbar-hide">
            
            {/* My Status */}
            <div className="flex items-center gap-4 mb-6 relative cursor-pointer p-3 rounded-2xl glass-card border border-cyan-500/20 shadow-lg glass-card-hover">
                <div className="relative" onClick={() => myGroup ? handleViewStatusGroup(myGroup) : fileInputRef.current.click()}>
                    <div className={`p-[2px] rounded-full ${loading ? 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 animate-spin p-[3px]' : myGroup ? 'bg-gradient-to-tr from-cyan-400 to-fuchsia-500 p-[2px]' : ''}`}>
                        <img 
                            src={userData?.profileImage || defaultProfile} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#090d18] bg-[#090d18] shadow-md"
                            alt="My Status"
                        />
                    </div>
                    {loading ? (
                        <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1 border-2 border-[#090d18] text-white shadow-lg">
                            <Loader2 size={12} className="animate-spin" />
                        </div>
                    ) : !myGroup && (
                        <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1 border-2 border-[#090d18] text-white shadow-lg">
                            <Plus size={12} />
                        </div>
                    )}
                </div>
                <div className="flex-1" onClick={() => myGroup ? handleViewStatusGroup(myGroup) : fileInputRef.current.click()}>
                    <h3 className="font-bold text-sm text-white">My Status</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                        {loading ? (
                            <span className="text-cyan-400 font-bold animate-pulse flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" /> Uploading status update...
                            </span>
                        ) : myGroup ? (
                            getLastStatusTime(myGroup)
                        ) : (
                            "Tap to add status update"
                        )}
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
                            <button 
                                onClick={() => { if (!loading) { setPreviewUrl(null); setSelectedFile(null); setCaption(""); } }} 
                                disabled={loading}
                                className="p-2 bg-gray-800/80 rounded-full disabled:opacity-40"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-0 bg-black overflow-hidden min-h-0 relative">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />

                            {/* UPLOADING WORK-IN-PROGRESS ANIMATION OVERLAY */}
                            <AnimatePresence>
                                {loading && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"
                                    >
                                        {/* Scanning Light Beam */}
                                        <motion.div 
                                            animate={{ y: ["-250%", "250%"] }}
                                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] pointer-events-none"
                                        />

                                        {/* Dual Rotating Gradient Rings */}
                                        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 border-r-fuchsia-500 animate-spin" />
                                            <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-indigo-400 animate-spin [animation-duration:1.5s]" />
                                            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                                <UploadCloud className="w-8 h-8 text-cyan-300 animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Text Banner */}
                                        <h3 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                                            <span>Uploading Status Update...</span>
                                        </h3>
                                        <p className="text-xs text-cyan-300/90 font-medium mt-1 mb-5 flex items-center gap-1">
                                            <Sparkles size={14} className="animate-spin text-amber-400" />
                                            <span>Processing media & saving to cloud...</span>
                                        </p>

                                        {/* Animated Filling Progress Bar */}
                                        <div className="w-64 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/40 p-0.5 shadow-inner">
                                            <motion.div 
                                                initial={{ width: "8%" }}
                                                animate={{ width: ["10%", "70%", "98%"] }}
                                                transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                                                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full shadow-md shadow-cyan-500/50"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="p-4 pb-8 sm:pb-4 pr-6 sm:pr-4 bg-gray-900 flex flex-col gap-3 shrink-0 relative w-full box-border">
                            {showEmojiPicker && (
                                <div className="absolute bottom-20 left-4 z-50 shadow-2xl">
                                    <EmojiPicker onEmojiClick={(e) => setCaption(prev => prev + e.emoji)} theme="dark" width={300} height={350} />
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={loading} className="text-gray-400 hover:text-white disabled:opacity-40">
                                    <Smile size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder={loading ? "Uploading..." : "Add a caption..."} 
                                    value={caption} 
                                    disabled={loading}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="bg-transparent border-none text-white focus:outline-none flex-1 text-sm disabled:opacity-50"
                                />
                                <button 
                                    onClick={handleUploadStatus}
                                    disabled={loading}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-white p-2.5 rounded-full font-bold transition disabled:opacity-50 flex items-center justify-center shadow-lg shadow-cyan-500/20"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Fullscreen Viewer Modal */}
            <AnimatePresence>
                {activeGroup && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-between p-0 sm:p-4 select-none"
                    >
                        <div className="w-full max-w-md h-full flex flex-col justify-between relative bg-slate-950 sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                            
                            {/* Progress Bars */}
                            <div className="absolute top-3 left-0 right-0 px-3 z-30 flex gap-1">
                                {activeGroup.statuses.map((s, idx) => (
                                    <div key={s._id} className="flex-1 bg-white/30 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-white h-full transition-all duration-1000 ease-linear"
                                            style={{
                                                width: idx < activeGroupIndex ? '100%' : idx === activeGroupIndex ? `${(statusViewTimer / 15) * 100}%` : '0%'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Viewer Header */}
                            <div className="absolute top-6 left-0 right-0 px-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pt-2 pb-6">
                                <div className="flex items-center gap-3">
                                    <img src={activeGroup.user?.profileImage || defaultProfile} className="w-10 h-10 rounded-full object-cover border border-white/50" alt="" />
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{activeGroup.user?.name || activeGroup.user?.userName}</h4>
                                        <p className="text-[11px] text-gray-300 font-medium">
                                            {new Date(activeGroup.statuses[activeGroupIndex]?.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeGroup.user?._id === userData?._id && activeGroup.statuses[activeGroupIndex]?.type !== 'custom' && (
                                        <button 
                                            onClick={() => handleDeleteStatus(activeGroup.statuses[activeGroupIndex]._id)} 
                                            className="text-rose-400 hover:text-rose-300 p-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-full transition"
                                            title="Delete status"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}

                                    <button onClick={() => setActiveGroup(null)} className="text-white p-2 hover:bg-white/20 rounded-full transition">
                                        <X size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* Media & Content Area */}
                            <div className="flex-1 flex items-center justify-center relative bg-black w-full overflow-hidden" onClick={nextStatus}>
                                {activeGroup.statuses[activeGroupIndex]?.type === 'custom' ? (
                                    <div className={`w-full h-full bg-gradient-to-br ${activeGroup.statuses[activeGroupIndex].bgColor} p-8 flex flex-col justify-center items-center text-center text-white relative`}>
                                        <div className="text-6xl mb-6 animate-bounce">{activeGroup.statuses[activeGroupIndex].icon}</div>
                                        <h2 className="text-2xl font-extrabold mb-3 tracking-tight">{activeGroup.statuses[activeGroupIndex].title}</h2>
                                        <p className="text-sm text-white/90 leading-relaxed mb-6 font-medium max-w-xs">{activeGroup.statuses[activeGroupIndex].description}</p>
                                        
                                        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs font-semibold text-white/90 max-w-xs shadow-lg">
                                            💡 {activeGroup.statuses[activeGroupIndex].instruction}
                                        </div>
                                    </div>
                                ) : (
                                    <img 
                                        src={activeGroup.statuses[activeGroupIndex]?.image || activeGroup.statuses[activeGroupIndex]?.mediaUrl || activeGroup.statuses[activeGroupIndex]?.media} 
                                        className="w-full h-full object-contain max-h-full" 
                                        alt="Status" 
                                    />
                                )}

                                {/* Left / Right Click Nav */}
                                <div className="absolute left-0 top-16 bottom-16 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); prevStatus(); }} />
                                <div className="absolute right-0 top-16 bottom-16 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); nextStatus(); }} />
                            </div>

                            {/* Caption & Bottom Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-3 z-30">
                                {activeGroup.statuses[activeGroupIndex]?.caption && (
                                    <p className="text-white text-sm font-medium text-center bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 max-w-[90%] truncate">
                                        {activeGroup.statuses[activeGroupIndex]?.caption}
                                    </p>
                                )}

                                {/* If My Status: Viewers Count Bar */}
                                {activeGroup.user?._id === userData?._id && activeGroup.statuses[activeGroupIndex]?.type !== 'custom' ? (
                                    <div 
                                        onClick={() => setShowViewers(!showViewers)} 
                                        className="flex items-center gap-2 text-white/90 text-xs bg-white/20 backdrop-blur-md px-4 py-2 rounded-full cursor-pointer hover:bg-white/30 transition font-bold"
                                    >
                                        <Eye size={16} /> {activeGroup.statuses[activeGroupIndex]?.viewers?.length || 0} Views
                                        <ChevronUp size={16} className={`transition-transform ${showViewers ? 'rotate-180' : ''}`} />
                                    </div>
                                ) : activeGroup.user?._id !== userData?._id ? (
                                    /* Reply Bar for other users */
                                    <div className="w-full relative">
                                        <button 
                                            onClick={() => setShowReplySheet(!showReplySheet)}
                                            className="w-full py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition"
                                        >
                                            <Send size={14} /> Reply to {activeGroup.user?.name?.split(' ')[0] || 'User'}
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {/* My Viewers Drawer Sheet */}
                            {showViewers && (
                                <motion.div 
                                    initial={{ y: 200 }} 
                                    animate={{ y: 0 }} 
                                    exit={{ y: 200 }}
                                    className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 z-40 max-h-60 overflow-y-auto text-white shadow-2xl"
                                >
                                    <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                                        <h4 className="font-bold text-sm text-slate-200">Viewed by ({activeGroup.statuses[activeGroupIndex]?.viewers?.length || 0})</h4>
                                        <button onClick={() => setShowViewers(false)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {activeGroup.statuses[activeGroupIndex]?.viewers?.map((v, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
                                                <img src={v.user?.profileImage || defaultProfile} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                <div>
                                                    <p className="text-xs font-bold">{v.user?.name || v.user?.userName}</p>
                                                    <p className="text-[10px] text-slate-400">{new Date(v.viewedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!activeGroup.statuses[activeGroupIndex]?.viewers || activeGroup.statuses[activeGroupIndex]?.viewers?.length === 0) && (
                                            <p className="text-center text-slate-500 py-4 text-xs">No views recorded yet.</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Reply Input Sheet Modal */}
                            {showReplySheet && (
                                <motion.div 
                                    initial={{ y: 200 }} 
                                    animate={{ y: 0 }} 
                                    exit={{ y: 200 }}
                                    className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 z-40 text-white shadow-2xl flex flex-col gap-3"
                                >
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                        <span className="text-xs font-bold text-slate-300">Reply to {activeGroup.user?.name || activeGroup.user?.userName}</span>
                                        <button onClick={() => setShowReplySheet(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                                    </div>

                                    {showReplyEmoji && (
                                        <div className="absolute bottom-16 left-2 z-50 shadow-2xl">
                                            <EmojiPicker onEmojiClick={(e) => setReplyText(prev => prev + e.emoji)} theme="dark" width={280} height={300} />
                                        </div>
                                    )}

                                    <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
                                        <button type="button" onClick={() => setShowReplyEmoji(!showReplyEmoji)} className="text-slate-400 hover:text-white p-2">
                                            <Smile size={20} />
                                        </button>
                                        <input 
                                            type="text" 
                                            placeholder="Type a reply..." 
                                            value={replyText} 
                                            onChange={(e) => setReplyText(e.target.value)}
                                            autoFocus
                                            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={replying || !replyText.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition disabled:opacity-50"
                                        >
                                            {replying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusSection;
