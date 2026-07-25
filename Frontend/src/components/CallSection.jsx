import React, { useState, useEffect } from 'react';
import { Phone, Video, Trash2, PhoneCall, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../config';
import defaultProfile from '../assets/profile.png';
import { motion, AnimatePresence } from 'framer-motion';

const CallSection = () => {
    const { userData, otherUsers } = useSelector(state => state.user);
    const [callHistory, setCallHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserSelectModal, setShowUserSelectModal] = useState(false);
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

    const handleDeleteCallLog = async (id) => {
        try {
            await axios.delete(`${serverUrl}/call/history/${id}`, { withCredentials: true });
            setCallHistory(prev => prev.filter(call => call._id !== id));
            setLongPressedId(null);
        } catch (error) {
            console.error("Failed to delete call history", error);
            alert("Failed to delete call record.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
    };

    let pressTimer;
    const handlePressStart = (id) => {
        pressTimer = setTimeout(() => {
            setLongPressedId(id);
        }, 600);
    };
    const handlePressEnd = () => {
        clearTimeout(pressTimer);
    };

    return (
        <div className="flex flex-col h-full relative bg-[#05070e] text-slate-100 p-2">
            <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-2.5 scrollbar-hide">
                {loading ? (
                    <div className="text-center text-slate-500 text-xs mt-12 font-medium">Loading call logs...</div>
                ) : callHistory.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs mt-12 font-medium">No call history recorded yet.</div>
                ) : (
                    callHistory.map(call => {
                        const isCaller = call.caller?._id === userData?._id;
                        const otherParty = isCaller ? call.receiver : call.caller;
                        
                        if (!otherParty) return null;

                        return (
                            <div 
                                key={call._id}
                                onTouchStart={() => handlePressStart(call._id)}
                                onTouchEnd={handlePressEnd}
                                onMouseDown={() => handlePressStart(call._id)}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                className={`relative w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 border glass-card border-cyan-500/15 shadow-md glass-card-hover ${longPressedId === call._id ? 'border-rose-500/50 bg-rose-500/10' : ''}`}
                            >
                                <img src={otherParty.profileImage || defaultProfile} alt="profile" className="w-11 h-11 rounded-full object-cover shadow-sm bg-[#090d18] border border-cyan-500/20" />
                                <div className="flex-1 overflow-hidden">
                                    <h2 className="font-bold text-sm text-white truncate">{otherParty.name || otherParty.userName}</h2>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                                        {isCaller ? (
                                            <span className="text-emerald-400 font-bold">↗ Outgoing</span>
                                        ) : (
                                            <span className="text-cyan-400 font-bold">↙ Incoming</span>
                                        )}
                                        <span>•</span>
                                        <span className="text-[11px] text-slate-500 font-medium">{formatDate(call.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="text-slate-400 p-2 rounded-xl bg-[#090d18] border border-cyan-500/20">
                                    {call.callType === 'video' ? <Video size={18} className="text-cyan-400" /> : <Phone size={18} className="text-emerald-400" />}
                                </div>

                                <AnimatePresence>
                                    {longPressedId === call._id && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-600 text-white p-2.5 rounded-xl shadow-xl cursor-pointer z-10"
                                            onClick={() => handleDeleteCallLog(call._id)}
                                        >
                                            <Trash2 size={18} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>

            {/* New Call Floating Button */}
            <motion.button 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowUserSelectModal(true)}
                className="absolute bottom-20 right-5 p-3.5 rounded-2xl glow-button text-white shadow-xl transition cursor-pointer z-20"
            >
                <PhoneCall size={20} />
            </motion.button>

            {/* User Select Modal */}
            <AnimatePresence>
                {showUserSelectModal && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="absolute inset-0 bg-[#0e1322]/95 backdrop-blur-2xl z-50 p-4 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-2">
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <PhoneCall className="text-cyan-400" size={16} /> Select Contact to Call
                            </h3>
                            <button onClick={() => setShowUserSelectModal(false)} className="p-1 text-slate-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                            {otherUsers?.filter(u => !u.isAI && u.userName !== 'ai').map(user => (
                                <div key={user._id} className="flex items-center justify-between p-2.5 rounded-2xl glass-card border border-cyan-500/15">
                                    <div className="flex items-center gap-3">
                                        <img src={user.profileImage || defaultProfile} alt="" className="w-10 h-10 rounded-full object-cover bg-[#090d18]" />
                                        <span className="font-bold text-xs text-white">{user.name || user.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setShowUserSelectModal(false);
                                                window.dispatchEvent(new CustomEvent('startCall', { detail: { userToCall: user, type: 'voice' } }));
                                            }}
                                            className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowUserSelectModal(false);
                                                window.dispatchEvent(new CustomEvent('startCall', { detail: { userToCall: user, type: 'video' } }));
                                            }}
                                            className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition cursor-pointer"
                                        >
                                            <Video size={18} />
                                        </button>
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
