import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../main';
import { Plus, X, Eye } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import defaultProfile from '../assets/profile.png';

const StatusSection = () => {
    const { userData } = useSelector(state => state.user);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [activeStatusIndex, setActiveStatusIndex] = useState(null);
    const [statusViewTimer, setStatusViewTimer] = useState(0);
    const [showViewers, setShowViewers] = useState(false);

    const fetchStatuses = async () => {
        try {
            const res = await axios.get(`${serverUrl}/status`, { withCredentials: true });
            setStatuses(res.data);
        } catch (error) {
            console.log("Error fetching statuses", error);
        }
    };

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        setLoading(true);
        try {
            await axios.post(`${serverUrl}/status/upload`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchStatuses();
        } catch (error) {
            console.log("Error uploading status", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStatus = async (index) => {
        setActiveStatusIndex(index);
        setStatusViewTimer(0);
        setShowViewers(false);
        const status = statuses[index];
        
        // Call API to mark as viewed
        if (status.user._id !== userData._id) {
            try {
                await axios.post(`${serverUrl}/status/view/${status._id}`, {}, { withCredentials: true });
            } catch (error) {
                console.log(error);
            }
        }
    };

    useEffect(() => {
        let timer;
        if (activeStatusIndex !== null && !showViewers) {
            timer = setInterval(() => {
                setStatusViewTimer(prev => {
                    if (prev >= 15) {
                        // Auto close after 15 seconds
                        setActiveStatusIndex(null);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [activeStatusIndex, showViewers]);

    const activeStatus = activeStatusIndex !== null ? statuses[activeStatusIndex] : null;

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
        const userId = status.user._id;
        if (!acc[userId]) {
            acc[userId] = { user: status.user, statuses: [] };
        }
        acc[userId].statuses.push(status);
        return acc;
    }, {});

    return (
        <div className="w-full h-full flex flex-col p-4 overflow-y-auto bg-slate-100">
            
            {/* My Status */}
            <div className="flex items-center gap-4 mb-6 relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="relative">
                    <img 
                        src={userData?.profileImage || defaultProfile} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
                        alt="My Status"
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                        <Plus size={12} className="text-white" />
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-[#0b2a5b]">My Status</h3>
                    <p className="text-sm text-gray-500">{loading ? "Uploading..." : "Tap to add status update"}</p>
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleUpload} 
                />
            </div>

            {/* Recent Updates */}
            <h3 className="text-md font-semibold text-gray-500 mb-3 px-2">Recent updates</h3>
            <div className="flex flex-col gap-2">
                {Object.values(groupedStatuses).map((group, idx) => (
                    <div 
                        key={group.user._id} 
                        className="flex items-center gap-4 cursor-pointer p-2 rounded-xl hover:bg-slate-200 transition-colors"
                        onClick={() => handleViewStatus(statuses.findIndex(s => s._id === group.statuses[0]._id))}
                    >
                        <div className="p-[2px] bg-green-500 rounded-full">
                            <img 
                                src={group.user.profileImage || defaultProfile} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                alt="Status"
                            />
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#0b2a5b]">{group.user._id === userData._id ? "My Status" : (group.user.name || group.user.userName)}</h4>
                            <p className="text-xs text-gray-500">
                                {new Date(group.statuses[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Viewer Modal */}
            <AnimatePresence>
                {activeStatus && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                    >
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-gray-600 flex gap-1 px-2 pt-2">
                            <div className="h-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${(statusViewTimer / 15) * 100}%` }}></div>
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3">
                                <img src={activeStatus.user.profileImage || defaultProfile} className="w-10 h-10 rounded-full" alt="User" />
                                <div className="text-white">
                                    <h4 className="font-semibold">{activeStatus.user.name || activeStatus.user.userName}</h4>
                                    <p className="text-xs text-gray-300">{new Date(activeStatus.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveStatusIndex(null)} className="text-white p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="flex-1 flex items-center justify-center relative p-4">
                            <img src={activeStatus.image} className="max-w-full max-h-full object-contain rounded-lg" alt="Status Content" />
                        </div>

                        {/* Viewers (Only if own status) */}
                        {activeStatus.user._id === userData._id && (
                            <div className="relative">
                                {showViewers && (
                                    <motion.div 
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-full left-0 right-0 bg-white rounded-t-3xl p-6 text-black min-h-[300px]"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">Viewed by {activeStatus.viewers.length}</h3>
                                            <button onClick={() => setShowViewers(false)}><X size={20} /></button>
                                        </div>
                                        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                                            {activeStatus.viewers.map((viewer, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <img src={viewer.user.profileImage || defaultProfile} className="w-10 h-10 rounded-full" alt="Viewer" />
                                                    <div>
                                                        <h4 className="font-semibold">{viewer.user.name || viewer.user.userName}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(viewer.viewedAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {activeStatus.viewers.length === 0 && (
                                                <p className="text-gray-500 text-center mt-4">No views yet</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                <div 
                                    className="p-4 bg-gray-900 text-white flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-800"
                                    onClick={() => setShowViewers(!showViewers)}
                                >
                                    <Eye size={20} />
                                    <span>{activeStatus.viewers.length}</span>
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
