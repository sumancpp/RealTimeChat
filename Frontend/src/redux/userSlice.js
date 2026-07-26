import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({

    name: "user",

    initialState: {

        userData: null,

        otherUsers: [],

        selectedUser: null,

        onlineUsers: [],
        
        isSocketConnected: false

    },

    reducers: {

        setUserData: (state, action) => {

            state.userData =
                action.payload;

        },

        setOtherUsers: (state, action) => {

            state.otherUsers =
                action.payload;

        },

        setSelectedUser: (state, action) => {

            state.selectedUser =
                action.payload;

        },
        
        updateOtherUser: (state, action) => {
            const index = state.otherUsers.findIndex(u => u._id === action.payload._id);
            if (index !== -1) {
                const updatedUser = { ...state.otherUsers[index], ...action.payload };
                state.otherUsers.splice(index, 1);
                state.otherUsers.unshift(updatedUser);
            }
        },

        clearUnreadCount: (state, action) => {
            const userId = action.payload?.toString();
            if (!userId) return;
            const index = state.otherUsers.findIndex(u => u._id?.toString() === userId);
            if (index !== -1) {
                state.otherUsers[index].unreadCount = 0;
            }
        },

        updateSidebarOnMessage: (state, action) => {
            const { newMessage, myId, currentChatId } = action.payload;
            const senderId = (typeof newMessage.sender === 'object' ? newMessage.sender?._id : newMessage.sender)?.toString();
            const receiverId = (typeof newMessage.receiver === 'object' ? newMessage.receiver?._id : newMessage.receiver)?.toString();
            const myIdStr = myId?.toString();
            const currentChatIdStr = currentChatId?.toString();

            const otherUserId = senderId === myIdStr ? receiverId : senderId;
            if (!otherUserId) return;

            const lastMsgText = newMessage.message || (newMessage.image ? "📷 Image" : (newMessage.voice ? "🎤 Voice Message" : ""));
            const lastMsgTime = newMessage.createdAt || new Date().toISOString();

            const index = state.otherUsers.findIndex(u => u._id?.toString() === otherUserId);
            if (index !== -1) {
                const user = state.otherUsers[index];
                const updatedUser = { 
                    ...user, 
                    lastMessage: lastMsgText,
                    lastMessageTime: lastMsgTime
                };
                
                if (senderId !== myIdStr && currentChatIdStr !== otherUserId) {
                    updatedUser.unreadCount = (updatedUser.unreadCount || 0) + 1;
                }
                
                state.otherUsers.splice(index, 1);
                state.otherUsers.unshift(updatedUser);
            } else if (typeof newMessage.sender === 'object' && newMessage.sender?._id) {
                const newSender = {
                    ...newMessage.sender,
                    lastMessage: lastMsgText,
                    lastMessageTime: lastMsgTime,
                    unreadCount: (senderId !== myIdStr && currentChatIdStr !== otherUserId) ? 1 : 0
                };
                state.otherUsers.unshift(newSender);
            }
        },

        setOnlineUsers: (state, action) => {

            state.onlineUsers =
                action.payload;

        },
        
        setSocketConnected: (state, action) => {
            state.isSocketConnected = action.payload;
        }

    }

});

export const {

    setUserData,

    setOtherUsers,

    setSelectedUser,
    
    updateOtherUser,

    clearUnreadCount,
    
    updateSidebarOnMessage,

    setOnlineUsers,
    
    setSocketConnected

} = userSlice.actions;

export default userSlice.reducer;