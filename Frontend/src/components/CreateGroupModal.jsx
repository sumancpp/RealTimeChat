import React, { useState } from 'react';
import axios from 'axios';
import { X, Camera, Check, Users } from 'lucide-react';
import { serverUrl } from '../config';
import defaultProfile from "../assets/profile.png";
import { motion } from 'framer-motion';

const CreateGroupModal = ({ isOpen, onClose, otherUsers, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupImage, setGroupImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGroupImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreate = async () => {
        if (!groupName.trim()) return alert('Group name is required');
        
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('groupName', groupName);
            formData.append('groupDescription', groupDescription);
            formData.append('participants', JSON.stringify(selectedUsers));
            if (groupImage) {
                formData.append('groupProfileImage', groupImage);
            }

            const res = await axios.post(`${serverUrl}/group/create`, formData, {
                withCredentials: true
            });

            if (res.data) {
                onGroupCreated(res.data);
                onClose();
                setGroupName('');
                setGroupDescription('');
                setGroupImage(null);
                setPreviewImage(null);
                setSelectedUsers([]);
            }
        } catch (error) {
            console.log(error);
            alert('Error creating group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="glass-panel border border-cyan-500/20 rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl backdrop-blur-2xl scrollbar-hide"
            >
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <Users className="text-cyan-400" size={20} /> Create New Group
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer">
                        <img 
                            src={previewImage || defaultProfile} 
                            alt="Group" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-xl bg-[#090d18] p-[2px]"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold mt-2">Tap to choose group avatar</span>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition font-medium"
                            placeholder="Enter group name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Description (Optional)</label>
                        <input 
                            type="text" 
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition font-medium"
                            placeholder="What is this group about?"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Select Members ({selectedUsers.length})</label>
                    <div className="max-h-44 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-2 bg-[#090d18] scrollbar-hide">
                        {otherUsers?.filter(u => !u.isAI && u.userName !== 'ai').map(user => {
                            const isSelected = selectedUsers.includes(user._id);
                            return (
                                <div 
                                    key={user._id} 
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                                        isSelected 
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold' 
                                            : 'hover:bg-slate-900 border-transparent text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.profileImage || defaultProfile} alt="" className="w-9 h-9 rounded-full object-cover bg-[#090d18]" />
                                        <span className="font-semibold text-xs sm:text-sm">{user.name || user.userName}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={loading || !groupName.trim()}
                    className="w-full py-3.5 glow-button text-white rounded-xl font-bold text-sm shadow-xl transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Create Group Now'
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
};

export default CreateGroupModal;
