import React, {
    useState,
    useEffect
} from 'react';

import { motion } from "framer-motion";

import {
    Search,
    X,
    LogOut,
    MessageCircle,
    Users,
    CircleDashed,
    Phone,
    Plus,
    Camera,
    Info,
    Sparkles
} from "lucide-react";

import StatusSection from "./StatusSection";
import CreateGroupModal from "./CreateGroupModal";
import CallSection from "./CallSection";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import { useNavigate } from "react-router-dom";

import defaultProfile from "../assets/profile.png";

import axios from 'axios';

import { serverUrl } from '../config';
import { socket, getSocket } from "../socket";

import {
    setOtherUsers,
    setUserData,
    setSelectedUser,
    clearUnreadCount,
    updateSidebarOnMessage
} from '../redux/userSlice';

const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const now = new Date();
    const lastSeen = new Date(date);
    const diff = Math.floor((now - lastSeen) / 60000);
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const SideBar = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        userData,
        otherUsers,
        selectedUser,
        onlineUsers
    } = useSelector(
        state => state.user
    );

    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("chats");
    const [groups, setGroups] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);

    const handleUserClick = (user) => {
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }
        if (user?._id) {
            dispatch(clearUnreadCount(user._id));
        }
        dispatch(setSelectedUser(user));
    };

    const handleTabChange = (tab) => {
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }
        setActiveTab(tab);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const activeSocket = getSocket() || socket;
        if (!activeSocket) return;

        const handleDirectMessage = (newMessage) => {
            const myId = userData?._id;
            dispatch(updateSidebarOnMessage({
                newMessage,
                myId,
                currentChatId: selectedUser?._id
            }));
        };

        const handleRealtimeGroupMessage = (newMessage) => {
            const groupId = newMessage.groupId || newMessage.conversationId;
            if (!groupId) return;

            setGroups((prevGroups) => {
                const index = prevGroups.findIndex(g => g._id === groupId);
                const senderObj = typeof newMessage.sender === 'object' ? newMessage.sender : null;
                const senderName = senderObj?.name?.split(' ')[0] || senderObj?.userName || (newMessage.isAnonymous ? "Secret Member" : "Member");
                const msgBody = newMessage.message || (newMessage.image ? "📷 Image" : (newMessage.voice ? "🎤 Voice" : ""));
                const lastMsgText = `${senderName}: ${msgBody}`;
                const lastMsgTime = newMessage.createdAt || new Date().toISOString();

                if (index !== -1) {
                    const group = prevGroups[index];
                    const updatedGroup = {
                        ...group,
                        lastMessage: lastMsgText,
                        lastMessageTime: lastMsgTime
                    };
                    const rest = prevGroups.filter((_, i) => i !== index);
                    return [updatedGroup, ...rest];
                } else {
                    fetchGroups();
                    return prevGroups;
                }
            });
        };

        activeSocket.on("newMessage", handleDirectMessage);
        activeSocket.on("newGroupMessage", handleRealtimeGroupMessage);
        return () => {
            activeSocket.off("newMessage", handleDirectMessage);
            activeSocket.off("newGroupMessage", handleRealtimeGroupMessage);
        };
    }, [userData?._id, selectedUser?._id, dispatch]);

    useEffect(() => {
        if (activeTab === "groups") {
            fetchGroups();
        }
    }, [activeTab]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${serverUrl}/group/all`, { withCredentials: true });
            setGroups(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearch = async (value) => {
        setSearch(value);
        try {
            if (!value.trim()) {
                const result = await axios.get(
                    `${serverUrl}/message/sorted-users?t=${Date.now()}`,
                    { withCredentials: true }
                );
                dispatch(setOtherUsers(result.data));
                return;
            }

            const result = await axios.get(
                `${serverUrl}/user/search?query=${value}&t=${Date.now()}`,
                { withCredentials: true }
            );
            dispatch(setOtherUsers(result.data));
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/logout`, { withCredentials: true });
            dispatch(setUserData(null));
            dispatch(setOtherUsers([]));
            dispatch(setSelectedUser(null));
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
        <div className='w-full h-full bg-[#05070e] border-r border-cyan-500/15 flex flex-col overflow-hidden relative font-sans text-slate-100'>

            {/* TOP HEADER & USER BAR */}
            <div className='w-full bg-[#0e1322]/85 backdrop-blur-2xl border-b border-cyan-500/15 px-5 pt-4 pb-4 flex flex-col gap-3 shadow-xl relative z-10 text-slate-100'>
                {/* BRAND & LOGOUT/PROFILE */}
                <div className='flex items-center justify-between'>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/about')}>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
                            <span>Baat</span>
                            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                                Cheet
                            </span>
                        </h1>
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>

                    <div className="flex items-center gap-3">
                        <img
                            src={userData?.profileImage || defaultProfile}
                            onClick={() => navigate("/profile")}
                            alt="profile"
                            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500 object-cover cursor-pointer hover:scale-105 transition shadow-lg"
                        />
                    </div>
                </div>

                {/* USER GREETING & SEARCH ICON */}
                <div className='flex items-center justify-between gap-3'>
                    {!showSearch ? (
                        <>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <p className='text-xs font-semibold text-slate-400'>Welcome,</p>
                                <h2 className='text-sm font-extrabold text-white truncate'>
                                    {userData?.name || userData?.userName}
                                </h2>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSearch(true)}
                                className='p-2.5 rounded-xl bg-[#090d18] border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition shadow-sm'
                            >
                                <Search size={16} />
                            </motion.button>
                        </>
                    ) : (
                        <div className='relative w-full'>
                            <Search size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400' />
                            <input
                                type="text"
                                placeholder='Search users or conversations...'
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                                className='w-full py-2 pl-10 pr-10 rounded-xl glass-input text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition font-medium'
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearch("");
                                    handleSearch("");
                                }}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer'
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ONLINE USERS HORIZONTAL TRAY */}
                {!showSearch && Array.isArray(otherUsers) && (
                    <div className='flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 border-t border-slate-800/80 pt-3'>
                        {otherUsers
                            .filter(user => (onlineUsers?.includes(user?._id) || user?.isAI || user?.userName === "ai"))
                            .map((user) => (
                                <div
                                    key={user._id}
                                    className='flex flex-col items-center min-w-[56px] cursor-pointer group'
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className='relative'>
                                        <img
                                            src={user?.profileImage || defaultProfile}
                                            alt="profile"
                                            className='w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-emerald-400 object-cover shadow-sm group-hover:scale-105 transition-transform'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingImage(user?.profileImage || defaultProfile);
                                            }}
                                        />
                                        <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#05070e] rounded-full animate-pulse' />
                                    </div>
                                    <p className='text-[11px] mt-1 truncate w-[56px] text-center text-slate-300 font-semibold group-hover:text-cyan-400 transition'>
                                        {user?.name?.split(' ')[0] || user?.userName}
                                    </p>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className='flex-1 overflow-y-auto scrollbar-hide bg-[#05070e] p-3 pb-20'>
                <div className={activeTab === "chats" ? "flex flex-col gap-2" : "hidden"}>
                    {(() => {
                        const displayUsers = Array.isArray(otherUsers) ? otherUsers : [];

                        if (displayUsers.length === 0) {
                            return (
                                <div className="text-center text-slate-500 text-xs mt-12 px-4 font-medium">
                                    No chats found. Use search to find friends!
                                </div>
                            );
                        }

                        return displayUsers.map((user) => {
                            const isSelected = selectedUser?._id === user._id;
                            const isOnline = onlineUsers?.includes(user?._id) || user?.isAI || user?.userName === "ai";
                            const isGhost = user?.isLastGhost || user?.lastMessage?.includes('Ghost SMS');

                            return (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserClick(user)}
                                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                        isSelected
                                            ? "bg-[#12192d] border-cyan-500/40 shadow-lg shadow-cyan-500/10 text-white"
                                            : "glass-card hover:bg-[#161e36] border-slate-800/80 text-slate-300"
                                    }`}
                                >
                                    <div className='relative flex-shrink-0'>
                                        <img
                                            src={user?.profileImage || defaultProfile}
                                            alt="profile"
                                            className='w-12 h-12 rounded-full object-cover shadow-sm hover:scale-105 transition-transform bg-[#090d18] border border-cyan-500/20'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingImage(user?.profileImage || defaultProfile);
                                            }}
                                        />
                                        {isOnline && (
                                            <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#05070e] rounded-full' />
                                        )}
                                        {user.unreadCount > 0 && (
                                            <span className='absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[10px] flex items-center justify-center font-bold shadow-md'>
                                                {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className='flex-1 overflow-hidden'>
                                        <div className='flex items-center justify-between'>
                                            <h2 className='font-bold text-sm text-white truncate'>
                                                {user?.name || user?.userName}
                                            </h2>
                                            {!isOnline && user.lastSeen && (
                                                <span className="text-[10px] text-slate-500 flex-shrink-0 font-medium">
                                                    {formatLastSeen(user.lastSeen)}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-xs truncate mt-0.5 ${
                                            isGhost 
                                                ? 'text-pink-400 font-bold flex items-center gap-1' 
                                                : isOnline 
                                                    ? 'text-emerald-400 font-semibold' 
                                                    : 'text-slate-400 font-medium'
                                        }`}>
                                            {isGhost 
                                                ? "Ghost SMS 👻" 
                                                : isOnline 
                                                    ? "Online" 
                                                    : (user.lastMessage || "Click to start chatting")}
                                        </p>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className={activeTab === "groups" ? "flex flex-col h-full relative" : "hidden"}>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {Array.isArray(groups) && groups.map((group) => {
                            const isSelected = selectedUser?._id === group._id;
                            return (
                                <div
                                    key={group._id}
                                    onClick={() => handleUserClick(group)}
                                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                        isSelected
                                            ? "bg-[#12192d] border-cyan-500/40 shadow-lg shadow-cyan-500/10 text-white"
                                            : "glass-card hover:bg-[#161e36] border-slate-800/80 text-slate-300"
                                    }`}
                                >
                                    <img
                                        src={group.groupProfileImage || defaultProfile}
                                        alt="group"
                                        className="w-12 h-12 rounded-full object-cover shadow-sm hover:scale-105 transition-transform bg-[#090d18] border border-cyan-500/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewingImage(group.groupProfileImage || defaultProfile);
                                        }}
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className="font-bold text-sm text-white truncate">{group.groupName}</h2>
                                        <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{group.lastMessage || "No messages yet"}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {groups.length === 0 && (
                            <div className="text-center text-slate-500 text-xs mt-12 font-medium">You are not in any groups yet. Click + below to create one!</div>
                        )}
                    </div>
                </div>

                <div className={activeTab === "status" ? "block h-full" : "hidden"}>
                    <StatusSection />
                </div>

                <div className={activeTab === "calls" ? "block h-full" : "hidden"}>
                    <CallSection />
                </div>

                <CreateGroupModal 
                    isOpen={showGroupModal} 
                    onClose={() => setShowGroupModal(false)} 
                    otherUsers={otherUsers}
                    onGroupCreated={(newGroup) => {
                        const formattedGroup = {
                            ...newGroup,
                            lastMessage: "Group created",
                            lastMessageTime: newGroup.createdAt || new Date().toISOString()
                        };
                        setGroups((prev) => [formattedGroup, ...prev.filter(g => g._id !== newGroup._id)]);
                        fetchGroups();
                    }}
                />
            </div>

            {/* BOTTOM NAV BAR */}
            <div className="absolute bottom-0 w-full bg-[#0e1322]/95 backdrop-blur-2xl border-t border-cyan-500/15 flex justify-around items-center px-2 py-3 shadow-2xl z-10 text-slate-400">
                <div 
                    onClick={() => handleTabChange("chats")} 
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                        activeTab === 'chats' ? 'text-cyan-400 font-extrabold scale-105' : 'hover:text-slate-200'
                    }`}
                >
                    <MessageCircle size={22} />
                    <span className="text-[10px] mt-1 tracking-wider font-bold">Chats</span>
                </div>

                <div 
                    onClick={() => handleTabChange("groups")} 
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                        activeTab === 'groups' ? 'text-cyan-400 font-extrabold scale-105' : 'hover:text-slate-200'
                    }`}
                >
                    <Users size={22} />
                    <span className="text-[10px] mt-1 tracking-wider font-bold">Groups</span>
                </div>

                <div 
                    onClick={() => handleTabChange("status")} 
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                        activeTab === 'status' ? 'text-cyan-400 font-extrabold scale-105' : 'hover:text-slate-200'
                    }`}
                >
                    <CircleDashed size={22} />
                    <span className="text-[10px] mt-1 tracking-wider font-bold">Status</span>
                </div>

                <div 
                    onClick={() => handleTabChange("calls")} 
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                        activeTab === 'calls' ? 'text-cyan-400 font-extrabold scale-105' : 'hover:text-slate-200'
                    }`}
                >
                    <Phone size={22} />
                    <span className="text-[10px] mt-1 tracking-wider font-bold">Calls</span>
                </div>

                <div 
                    onClick={() => navigate("/about")} 
                    className="flex flex-col items-center cursor-pointer transition-all hover:text-indigo-400 font-bold"
                >
                    <Info size={22} />
                    <span className="text-[10px] mt-1 tracking-wider font-bold">About</span>
                </div>
            </div>

            {/* DYNAMIC FLOATING ACTION BUTTON */}
            {activeTab !== "calls" && (
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                        if (activeTab === "chats") {
                            handleLogout();
                        } else if (activeTab === "groups") {
                            setShowGroupModal(true);
                        } else if (activeTab === "status") {
                            const fileInput = document.getElementById('status-file-input');
                            if (fileInput) fileInput.click();
                        }
                    }}
                    className={`absolute bottom-20 right-5 p-3.5 rounded-2xl shadow-xl border transition cursor-pointer z-20 ${
                        activeTab === "chats" 
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" 
                            : "glow-button text-white border-cyan-400/40"
                    }`}
                >
                    {activeTab === "chats" && <LogOut className="rotate-180" size={20} />}
                    {activeTab === "groups" && <Plus size={20} />}
                    {activeTab === "status" && <Camera size={20} />}
                </motion.button>
            )}

        </div>

        {/* PROFILE IMAGE VIEWER MODAL */}
        {viewingImage && (
            <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
                onClick={() => setViewingImage(null)}
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative max-w-sm w-full max-h-[80vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={viewingImage} 
                        alt="Profile View" 
                        className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-2xl bg-[#090d18] border border-slate-800"
                    />
                    <button 
                        className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full transition"
                        onClick={() => setViewingImage(null)}
                    >
                        <X size={26} />
                    </button>
                </motion.div>
            </div>
        )}
        </>
    );
};

export default SideBar;