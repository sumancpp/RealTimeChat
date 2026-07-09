import React, { useState } from 'react';
import axios from 'axios';
import { X, Camera, Check } from 'lucide-react';
import { serverUrl } from '../config';
import defaultProfile from "../assets/profile.png";

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
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] px-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0b2a5b]">Create Group</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer">
                        <img 
                            src={previewImage || defaultProfile} 
                            alt="Group" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter group name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input 
                            type="text" 
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter description"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Participants</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                        {otherUsers?.filter(u => !u.isAI && u.userName !== 'ai').map(user => (
                            <div 
                                key={user._id} 
                                onClick={() => toggleUser(user._id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.includes(user._id) ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={user.profileImage || defaultProfile} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-medium text-gray-800">{user.name || user.userName}</span>
                                </div>
                                {selectedUsers.includes(user._id) && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleCreate}
                    disabled={loading || !groupName.trim()}
                    className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-green-300 transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </div>
        </div>
    );
};

export default CreateGroupModal;
