import React, { useState } from 'react';
import axios from 'axios';
import { X, Shield, UserPlus, Check, LogOut, UserMinus, Trash2, Edit2 } from 'lucide-react';
import { serverUrl } from '../config';
import defaultProfile from "../assets/profile.png";
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';

const GroupInfoModal = ({ isOpen, onClose, group }) => {
    const dispatch = useDispatch();
    const { userData, otherUsers } = useSelector(state => state.user);
    const [showAddUsers, setShowAddUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupDesc, setEditGroupDesc] = useState("");
    const [editGroupImage, setEditGroupImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    if (!isOpen || !group) return null;

    const isAdmin = group.admins?.some(admin => admin._id === userData._id || admin === userData._id);

    const handleMakeAdmin = async (userId) => {
        try {
            const res = await axios.put(`${serverUrl}/group/make-admin/${group._id}`, { userIdToMakeAdmin: userId }, { withCredentials: true });
            if (res.data) {
                dispatch(setSelectedUser(res.data));
            }
        } catch (error) {
            console.log(error);
            alert('Error making admin');
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await axios.put(`${serverUrl}/group/leave/${group._id}`, {}, { withCredentials: true });
            dispatch(setSelectedUser(null));
            onClose();
        } catch (error) {
            console.log(error);
            alert('Error leaving group');
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            const res = await axios.put(`${serverUrl}/group/remove-user/${group._id}/${userId}`, {}, { withCredentials: true });
            if (res.data) {
                dispatch(setSelectedUser(res.data));
            }
        } catch (error) {
            console.log(error);
            alert('Error removing user');
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to delete this group for everyone?")) return;
        try {
            await axios.delete(`${serverUrl}/group/delete/${group._id}`, { withCredentials: true });
            dispatch(setSelectedUser(null));
            onClose();
        } catch (error) {
            console.log(error);
            alert('Error deleting group');
        }
    };

    const handleEditClick = () => {
        setEditGroupName(group.groupName);
        setEditGroupDesc(group.groupDescription || "");
        setEditGroupImage(null);
        setPreviewImage(group.groupProfileImage || defaultProfile);
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('groupName', editGroupName);
            formData.append('groupDescription', editGroupDesc);
            if (editGroupImage) {
                formData.append('groupProfileImage', editGroupImage);
            }

            const res = await axios.put(`${serverUrl}/group/edit/${group._id}`, formData, { 
                withCredentials: true
            });
            if (res.data) {
                dispatch(setSelectedUser(res.data));
                setIsEditingInfo(false);
            }
        } catch (error) {
            console.log(error);
            alert('Error updating group info');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUsers = async () => {
        if (selectedUsers.length === 0) return;
        try {
            setLoading(true);
            const res = await axios.put(`${serverUrl}/group/add-users/${group._id}`, { usersToAdd: selectedUsers }, { withCredentials: true });
            if (res.data) {
                dispatch(setSelectedUser(res.data));
                setShowAddUsers(false);
                setSelectedUsers([]);
            }
        } catch (error) {
            console.log(error);
            alert('Error adding users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    // Filter out users already in the group
    const participantIds = group.participants?.map(p => p._id || p) || [];
    const availableUsersToAdd = otherUsers?.filter(u => !participantIds.includes(u._id) && !u.isAI && u.userName !== 'ai');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="glass-panel border border-cyan-500/20 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative text-slate-100 shadow-2xl backdrop-blur-2xl p-6 scrollbar-hide">
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-6 pt-2">
                    <div className="relative">
                        <img 
                            src={isEditingInfo ? previewImage : (group.groupProfileImage || defaultProfile)} 
                            alt="Group" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-xl bg-[#090d18] p-[2px] mb-3"
                        />
                        {isEditingInfo && (
                            <label className="absolute bottom-3 right-0 bg-cyan-600 p-2 rounded-full text-white cursor-pointer hover:bg-cyan-500 transition shadow-lg">
                                <Edit2 size={14} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setEditGroupImage(e.target.files[0]);
                                            setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    
                    {!isEditingInfo ? (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white">{group.groupName}</h3>
                                {isAdmin && (
                                    <button onClick={handleEditClick} className="text-slate-400 hover:text-cyan-400 transition">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            {group.groupDescription && <p className="text-slate-400 text-xs mt-1 text-center max-w-full break-words font-medium">{group.groupDescription}</p>}
                        </>
                    ) : (
                        <div className="w-full flex flex-col gap-2.5 mt-2">
                            <input 
                                type="text" 
                                value={editGroupName}
                                onChange={(e) => setEditGroupName(e.target.value)}
                                className="w-full glass-input text-center text-slate-100 font-semibold rounded-xl py-2 px-3 text-sm focus:outline-none"
                                placeholder="Group Name"
                            />
                            <textarea 
                                value={editGroupDesc}
                                onChange={(e) => setEditGroupDesc(e.target.value)}
                                className="w-full glass-input text-center text-xs text-slate-300 rounded-xl py-2 px-3 focus:outline-none resize-none font-medium"
                                placeholder="Group Description"
                                rows="2"
                            />
                            <div className="flex gap-2 justify-center mt-2">
                                <button 
                                    onClick={() => setIsEditingInfo(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveInfo}
                                    disabled={loading || !editGroupName.trim()}
                                    className="px-4 py-2 text-xs font-semibold text-white glow-button rounded-xl disabled:opacity-50"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!showAddUsers ? (
                    <>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Participants ({group.participants?.length || 0})</h4>
                            {isAdmin && (
                                <button onClick={() => setShowAddUsers(true)} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full font-bold hover:bg-cyan-500/20 transition">
                                    <UserPlus size={14} /> Add Member
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
                            {group.participants?.map(participant => {
                                const isParticipantAdmin = group.admins?.some(admin => admin._id === participant._id || admin === participant._id);
                                return (
                                    <div key={participant._id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#090d18]/70 border border-slate-800/80">
                                        <div className="flex items-center gap-3">
                                            <img src={participant.profileImage || defaultProfile} alt="" className="w-9 h-9 rounded-full object-cover bg-[#090d18]" />
                                            <div>
                                                <p className="font-semibold text-xs text-slate-100">{participant.name || participant.userName}</p>
                                                {isParticipantAdmin && <span className="text-[10px] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full font-bold">Admin</span>}
                                            </div>
                                        </div>
                                        {isAdmin && participant._id !== userData._id && (
                                            <div className="flex gap-2 items-center">
                                                {!isParticipantAdmin && (
                                                    <button 
                                                        onClick={() => handleMakeAdmin(participant._id)}
                                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 p-1 bg-cyan-500/10 rounded-lg"
                                                    >
                                                        <Shield size={12} /> Admin
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleRemoveUser(participant._id)}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 p-1 bg-rose-500/10 rounded-lg"
                                                >
                                                    <UserMinus size={12} /> Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2">
                            <button 
                                onClick={handleLeaveGroup}
                                className="w-full flex justify-center items-center gap-2 py-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                <LogOut size={16} /> Leave Group
                            </button>
                            <button 
                                onClick={handleDeleteGroup}
                                className="w-full flex justify-center items-center gap-2 py-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                <Trash2 size={16} /> Delete Group for Everyone
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => setShowAddUsers(false)} className="text-xs text-cyan-400 hover:underline font-bold">← Back</button>
                            <h4 className="font-extrabold text-white text-sm flex-1 text-center pr-8">Add Members to Group</h4>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-2 mb-4 bg-[#090d18] scrollbar-hide">
                            {availableUsersToAdd?.length > 0 ? availableUsersToAdd.map(user => (
                                <div 
                                    key={user._id} 
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${
                                        selectedUsers.includes(user._id) 
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold' 
                                            : 'hover:bg-slate-900 border-transparent text-slate-300 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.profileImage || defaultProfile} alt="" className="w-9 h-9 rounded-full object-cover bg-[#090d18]" />
                                        <span className="font-semibold text-xs">{user.name || user.userName}</span>
                                    </div>
                                    {selectedUsers.includes(user._id) && (
                                        <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p className="text-center text-slate-500 py-4 text-xs font-medium">No new users available to add.</p>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleAddUsers}
                            disabled={loading || selectedUsers.length === 0}
                            className="w-full py-3.5 glow-button text-white rounded-xl font-bold text-xs shadow-xl transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        >
                            {loading ? 'Adding Members...' : `Add ${selectedUsers.length > 0 ? selectedUsers.length : ''} Members`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupInfoModal;
