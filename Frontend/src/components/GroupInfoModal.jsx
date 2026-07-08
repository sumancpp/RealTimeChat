import React, { useState } from 'react';
import axios from 'axios';
import { X, Shield, UserPlus, Check } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] px-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0b2a5b]">Group Info</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <img 
                        src={group.groupProfileImage || defaultProfile} 
                        alt="Group" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md mb-3"
                    />
                    <h3 className="text-xl font-bold text-gray-800">{group.groupName}</h3>
                    {group.groupDescription && <p className="text-gray-500 text-sm mt-1 text-center">{group.groupDescription}</p>}
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
                                        {isAdmin && !isParticipantAdmin && participant._id !== userData._id && (
                                            <button 
                                                onClick={() => handleMakeAdmin(participant._id)}
                                                className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1"
                                            >
                                                <Shield size={14} /> Make Admin
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
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
