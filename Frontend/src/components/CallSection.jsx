import React, { useState, useEffect } from 'react';
import { Phone, Video, Trash2, PhoneCall } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../config';
import defaultProfile from '../assets/profile.png';
import { motion, AnimatePresence } from 'framer-motion';

const CallSection = () => {
    const { userData, otherUsers } = useSelector(state => state.user);
    const [callHistory, setCallHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserList, setShowUserList] = useState(false);
    const [longPressedId, setLongPressedId] = useState(null);

    useEffect(() => {
        fetchCallHistory();
    }, []);

    const fetchCallHistory = async () => {
        try {
            const res = await axios.get(`${serverUrl}/call/history`, { withCredentials: true });
            setCallHistory(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch call history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${serverUrl}/call/history/${id}`, { withCredentials: true });
            setCallHistory(prev => prev.filter(call => call._id !== id));
            setLongPressedId(null);
        } catch (error) {
            console.error("Failed to delete call history", error);
            alert("Failed to delete call record.");
        }
    };

    const startCall = (user, type) => {
        setShowUserList(false);
        const event = new CustomEvent('startCall', { detail: { userToCall: user, type } });
        window.dispatchEvent(event);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
    };

    // Long press logic
    let pressTimer;
    const handlePressStart = (id) => {
        pressTimer = setTimeout(() => {
            setLongPressedId(id);
        }, 600); // 600ms long press
    };
    const handlePressEnd = () => {
        clearTimeout(pressTimer);
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center px-4 py-3 bg-white shadow-sm border-b">
                <h2 className="font-semibold text-gray-700">Calls</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">
                {loading ? (
                    <p className="text-center text-gray-500 mt-10">Loading...</p>
                ) : callHistory.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No call history yet.</p>
                ) : (
                    callHistory.map(call => {
                        const isCaller = call.caller?._id === userData?._id;
                        const otherParty = isCaller ? call.receiver : call.caller;
                        
                        if (!otherParty) return null; // Fallback if user deleted

                        return (
                            <div 
                                key={call._id}
                                onTouchStart={() => handlePressStart(call._id)}
                                onTouchEnd={handlePressEnd}
                                onMouseDown={() => handlePressStart(call._id)}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                className={`relative w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 shadow-sm border border-gray-100 bg-white ${longPressedId === call._id ? 'bg-red-50' : ''}`}
                            >
                                <img src={otherParty.profileImage || defaultProfile} alt="profile" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                                <div className="flex-1 overflow-hidden">
                                    <h2 className="font-semibold text-[#0b2a5b] truncate">{otherParty.name || otherParty.userName}</h2>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        {isCaller ? (
                                            <span className="text-green-500">↗ Outgoing</span>
                                        ) : (
                                            <span className="text-blue-500">↙ Incoming</span>
                                        )}
                                        <span className="mx-1">•</span>
                                        <span>{formatDate(call.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {call.callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
                                </div>

                                {/* Delete Overlay */}
                                <AnimatePresence>
                                    {longPressedId === call._id && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full shadow-lg cursor-pointer z-10"
                                            onClick={() => handleDelete(call._id)}
                                        >
                                            <Trash2 size={20} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Action Button */}
            <div 
                className="absolute bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-transform active:scale-95"
                onClick={() => setShowUserList(true)}
            >
                <PhoneCall size={24} />
            </div>

            {/* User List Modal */}
            <AnimatePresence>
                {showUserList && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-0 bg-white z-50 flex flex-col"
                    >
                        <div className="flex justify-between items-center px-4 py-3 bg-white shadow-sm border-b">
                            <h2 className="font-semibold text-gray-700">Select User</h2>
                            <button onClick={() => setShowUserList(false)} className="text-gray-500 font-bold p-2">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">
                            {otherUsers.map(user => (
                                <div key={user._id} className="w-full flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <img src={user.profileImage || defaultProfile} alt="profile" className="w-12 h-12 rounded-full object-cover" />
                                        <h2 className="font-semibold text-[#0b2a5b]">{user.name || user.userName}</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => startCall(user, 'voice')} className="text-gray-600 hover:text-green-500 p-2"><Phone size={22} /></button>
                                        <button onClick={() => startCall(user, 'video')} className="text-gray-600 hover:text-green-500 p-2"><Video size={22} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CallSection;
