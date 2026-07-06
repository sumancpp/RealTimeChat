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
    Phone
} from "lucide-react";

import StatusSection from "./StatusSection";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import { useNavigate } from "react-router-dom";

import defaultProfile from "../assets/profile.png";

import axios from 'axios';

import { serverUrl } from '../main';

import {
    setOtherUsers,
    setUserData,
    setSelectedUser
} from '../redux/userSlice';

const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const now = new Date();
    const lastSeen = new Date(date);
    const diff = Math.floor((now - lastSeen) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `Last seen ${diff}m ago`;
    const timeString = lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (now.toDateString() === lastSeen.toDateString()) {
        return `Last seen today at ${timeString}`;
    }
    
    const dateString = lastSeen.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Last seen ${dateString} at ${timeString}`;
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

    const [showSearch, setShowSearch] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [activeTab, setActiveTab] = 
        useState("chats");

    // SEARCH USERS
    const handleSearch = async (
        value
    ) => {

        setSearch(value);

        try {

            // EMPTY SEARCH
            if (!value.trim()) {

                const result =
                    await axios.get(

                        `${serverUrl}/message/sorted-users`,

                        {
                            withCredentials: true
                        }

                    );

                dispatch(
                    setOtherUsers(
                        result.data
                    )
                );

                return;
            }

            const result =
                await axios.get(

                    `${serverUrl}/user/search?query=${value}`,

                    {
                        withCredentials: true
                    }

                );

            dispatch(
                setOtherUsers(
                    result.data
                )
            );

        } catch (error) {

            console.log(error);

        }

    };

    // LOGOUT
    const handleLogout = async () => {

        try {

            await axios.get(

                `${serverUrl}/logout`,

                {
                    withCredentials: true
                }

            );

            dispatch(
                setUserData(null)
            );

            dispatch(
                setOtherUsers([])
            );

            dispatch(
                setSelectedUser(null)
            );

            navigate("/login");

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className='w-full h-screen bg-slate-100 border-r border-gray-300 flex flex-col overflow-hidden relative'>

            {/* TOP SECTION */}
            <motion.div
                initial={{
                    y: -80,
                    opacity: 0
                }}
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    duration: 0.6
                }}
                className='w-full min-h-[280px] bg-[#e6fffa] rounded-b-[30%] shadow-md px-5 py-4'
            >

                {/* HEADER */}
                <div className='flex items-center justify-between'>

                    <h1 className="text-4xl font-bold tracking-wide font-[Poppins]">

                        <span className="text-[#0b2a5b]">

                            Baat

                        </span>

                        <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">

                            Cheet

                        </span>

                    </h1>

                    <img
                        src={
                            userData?.profileImage ||
                            defaultProfile
                        }
                        onClick={() =>
                            navigate("/profile")
                        }
                        alt="profile"
                        className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover cursor-pointer"
                    />

                </div>

                {/* USER INFO */}
                <div className='mt-5 flex items-center gap-2'>

                    <p className='text-lg text-gray-500'>

                        Hey 👋

                    </p>

                    <h1 className='text-2xl font-semibold text-[#02085f]'>

                        {
                            userData?.name ||
                            userData?.userName
                        }

                    </h1>

                </div>

                {/* SEARCH */}
                <div className='w-full mt-4'>

                    {!showSearch ? (

                        <div className='flex items-center gap-4'>

                            {/* SEARCH ICON */}
                            <div className='relative'>

                                <motion.button
                                    whileHover={{
                                        scale: 1.05
                                    }}
                                    whileTap={{
                                        scale: 0.95
                                    }}
                                    onClick={() =>
                                        setShowSearch(true)
                                    }
                                    className='p-3 rounded-full bg-white shadow-md cursor-pointer flex-shrink-0'
                                >

                                    <Search
                                        size={20}
                                        className='text-gray-700'
                                    />

                                </motion.button>

                                {/* ONLINE COUNT */}
                                {/* {
                                    onlineUsers?.length > 0 && (

                                        <span
                                            className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center'
                                        >

                                            {
                                                onlineUsers.length
                                            }

                                        </span>

                                    )
                                } */}

                            </div>

                            {/* ONLINE USERS */}
                            <div className='flex items-center overflow-x-auto scrollbar-hide gap-4 flex-1 pb-2 mt-7'>

                                {
                                    otherUsers
                                        ?.filter(user =>
                                            (onlineUsers.includes(user._id) || user.isAI || user.userName === "ai")
                                        )
                                        ?.map((user) => (

                                            <div
                                                key={user._id}
                                                className='flex flex-col items-center min-w-[70px] cursor-pointer'
                                                onClick={() =>
                                                    dispatch(
                                                        setSelectedUser(
                                                            user
                                                        )
                                                    )
                                                }
                                            >

                                                <div className='relative'>

                                                    <img
                                                        src={
                                                            user?.profileImage ||
                                                            defaultProfile
                                                        }
                                                        alt="profile"
                                                        className='w-11 h-11 rounded-full border-2 border-green-500 object-cover shadow-md'
                                                    />

                                                    <span
                                                        className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'
                                                    />

                                                </div>

                                                <p className='text-sm mt-1 truncate w-[70px] text-center text-[#0b2a5b] font-medium'>

                                                    {
                                                        user?.name ||
                                                        user?.userName
                                                    }

                                                </p>

                                            </div>

                                        ))
                                }

                            </div>

                        </div>

                    ) : (

                        <div className='w-full'>

                            <div className='relative w-full'>

                                <Search
                                    size={18}
                                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'
                                />

                                <input
                                    type="text"
                                    placeholder='Search People...'
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(
                                            e.target.value
                                        )
                                    }
                                    className='w-full py-2 pl-11 pr-12 rounded-3xl border border-gray-300 bg-white shadow-sm outline-none'
                                />

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowSearch(false);

                                        setSearch("");

                                    }}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer'
                                >

                                    <X size={18} />

                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </motion.div>

            {/* USER LIST */}
            {/* MAIN CONTENT AREA */}
            <div className='flex-1 overflow-y-auto scrollbar-hide bg-slate-100 mt-1 pb-16'>
                {activeTab === "chats" && (
                    <div className='flex flex-col gap-2 px-3 py-4'>
                        {
                            otherUsers?.map((user) => (

                                <div
                                    key={user._id}
                                    onClick={() =>
                                        dispatch(
                                            setSelectedUser(
                                                user
                                            )
                                        )
                                    }
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg

                                    ${selectedUser?._id ===
                                            user._id

                                            ? "bg-blue-100"

                                            : "hover:bg-slate-200"
                                        }`}
                                >

                                    <div className='relative'>

                                        <img
                                            src={
                                                user?.profileImage ||
                                                defaultProfile
                                            }
                                            alt="profile"
                                            className='w-14 h-14 rounded-full object-cover'
                                        />

                                        {
                                            (onlineUsers.includes(user._id) || user.isAI || user.userName === "ai") && (

                                                <span
                                                    className='absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full'
                                                />

                                            )
                                        }

                                        {
                                            user.unreadCount > 0 && (

                                                <span
                                                    className='absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold'
                                                >

                                                    {
                                                        user.unreadCount > 99
                                                            ? "99+"
                                                            : user.unreadCount
                                                    }

                                                </span>

                                            )
                                        }

                                    </div>

                                    <div className='flex-1 overflow-hidden rounded-2xl'>

                                        <h2 className='font-semibold text-[#0b2a5b] truncate ml-2'>

                                            {
                                                user.unreadCount > 0
                                                    ? `${user.unreadCount} new`
                                                    : (
                                                        user?.name ||
                                                        user?.userName
                                                    )
                                            }

                                        </h2>

                                        <p className='text-sm text-gray-500 truncate ml-2'>

                                            {
                                                (onlineUsers.includes(user._id) || user.isAI || user.userName === "ai")
                                                    ? "Online"
                                                    : (
                                                        user.lastMessage ||
                                                        formatLastSeen(
                                                            user.lastSeen
                                                        )
                                                    )
                                            }

                                        </p>

                                    </div>

                                </div>

                            ))
                        }

                    </div>
                )}

                {activeTab === "groups" && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Groups feature coming soon...</p>
                    </div>
                )}

                {activeTab === "status" && (
                    <StatusSection />
                )}

                {activeTab === "calls" && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Calls feature coming soon...</p>
                    </div>
                )}
            </div>

            {/* BOTTOM NAV BAR */}
            <div className="absolute bottom-0 w-full bg-white border-t border-gray-300 flex justify-around items-center p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 rounded-br-none sm:rounded-br-3xl sm:rounded-bl-3xl lg:rounded-none">
                <div onClick={() => setActiveTab("chats")} className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'chats' ? 'text-green-500' : 'text-gray-500'}`}>
                    <MessageCircle size={24} />
                    <span className="text-[10px] font-semibold mt-1">Chats</span>
                </div>
                <div onClick={() => setActiveTab("groups")} className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'groups' ? 'text-green-500' : 'text-gray-500'}`}>
                    <Users size={24} />
                    <span className="text-[10px] font-semibold mt-1">Groups</span>
                </div>
                <div onClick={() => setActiveTab("status")} className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'status' ? 'text-green-500' : 'text-gray-500'}`}>
                    <CircleDashed size={24} />
                    <span className="text-[10px] font-semibold mt-1">Status</span>
                </div>
                <div onClick={() => setActiveTab("calls")} className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'calls' ? 'text-green-500' : 'text-gray-500'}`}>
                    <Phone size={24} />
                    <span className="text-[10px] font-semibold mt-1">Calls</span>
                </div>
            </div>

            {/* LOGOUT */}
            <motion.button
                whileHover={{
                    scale: 1.08
                }}
                whileTap={{
                    scale: 0.92
                }}
                onClick={handleLogout}
                className="absolute bottom-20 right-5 p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-red-50 transition cursor-pointer rotate-180 z-20"
            >

                <LogOut
                    className="text-red-500"
                    size={22}
                />

            </motion.button>

        </div>

    );

};

export default SideBar;