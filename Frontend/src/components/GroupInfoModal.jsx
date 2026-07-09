import React, { useState } from 'react';
import axios from 'axios';
import { X, Shield, UserPlus, Check, LogOut, UserMinus, Trash2, Edit2 } from 'lucide-react';
import { serverUrl } from '../main';
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
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        try {
            setLoading(true);
            const res = await axios.put(`${serverUrl}/group/edit/${group._id}`, { groupName: editGroupName, groupDescription: editGroupDesc }, { withCredentials: true });
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
        <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            <div className="w-full h-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col items-center mb-6">
                    <img 
                        src={group.groupProfileImage || defaultProfile} 
                        alt="Group" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md mb-3"
                    />
                    
                    {!isEditingInfo ? (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-800">{group.groupName}</h3>
                                {isAdmin && (
                                    <button onClick={handleEditClick} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            {group.groupDescription && <p className="text-gray-500 text-sm mt-1 text-center max-w-full break-words">{group.groupDescription}</p>}
                        </>
                    ) : (
                        <div className="w-full flex flex-col gap-2 mt-2 px-2">
                            <input 
                                type="text" 
                                value={editGroupName}
                                onChange={(e) => setEditGroupName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-center text-gray-800 font-semibold"
                                placeholder="Group Name"
                            />
                            <textarea 
                                value={editGroupDesc}
                                onChange={(e) => setEditGroupDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-center text-sm text-gray-600 resize-none"
                                placeholder="Group Description"
                                rows="2"
                            />
                            <div className="flex gap-2 justify-center mt-2">
                                <button 
                                    onClick={() => setIsEditingInfo(false)}
                                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveInfo}
                                    disabled={loading || !editGroupName.trim()}
                                    className="px-4 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!showAddUsers ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-700">Participants ({group.participants?.length || 0})</h4>
                            {isAdmin && (
                                <button onClick={() => setShowAddUsers(true)} className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium hover:bg-green-100">
                                    <UserPlus size={16} /> Add
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {group.participants?.map(participant => {
                                const isParticipantAdmin = group.admins?.some(admin => admin._id === participant._id || admin === participant._id);
                                return (
                                    <div key={participant._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <img src={participant.profileImage || defaultProfile} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-medium text-gray-800">{participant.name || participant.userName}</p>
                                                {isParticipantAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                                            </div>
                                        </div>
                                        {isAdmin && participant._id !== userData._id && (
                                            <div className="flex flex-col gap-2 items-end">
                                                {!isParticipantAdmin && (
                                                    <button 
                                                        onClick={() => handleMakeAdmin(participant._id)}
                                                        className="text-[11px] text-blue-500 font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        <Shield size={12} /> Make Admin
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleRemoveUser(participant._id)}
                                                    className="text-[11px] text-red-500 font-medium hover:underline flex items-center gap-1"
                                                >
                                                    <UserMinus size={12} /> Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                            <button 
                                onClick={handleLeaveGroup}
                                className="w-full flex justify-center items-center gap-2 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold transition-colors"
                            >
                                <LogOut size={18} /> Leave Group
                            </button>
                            <button 
                                onClick={handleDeleteGroup}
                                className="w-full flex justify-center items-center gap-2 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold transition-colors"
                            >
                                <Trash2 size={18} /> Delete Group
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => setShowAddUsers(false)} className="text-sm text-gray-500 hover:text-gray-800 font-medium">← Back</button>
                            <h4 className="font-semibold text-gray-700 flex-1 text-center pr-8">Add Users</h4>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2 mb-4">
                            {availableUsersToAdd?.length > 0 ? availableUsersToAdd.map(user => (
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
                            )) : (
                                <p className="text-center text-gray-500 py-4 text-sm">No new users available to add.</p>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleAddUsers}
                            disabled={loading || selectedUsers.length === 0}
                            className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-green-300 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : `Add ${selectedUsers.length > 0 ? selectedUsers.length : ''} Users`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupInfoModal;
