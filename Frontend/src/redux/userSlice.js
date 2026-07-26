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

        updateSidebarOnMessage: (state, action) => {
            const { newMessage, myId, currentChatId } = action.payload;
            const senderId = typeof newMessage.sender === 'object' ? newMessage.sender._id : newMessage.sender;
            const receiverId = typeof newMessage.receiver === 'object' ? newMessage.receiver._id : newMessage.receiver;
            const otherUserId = senderId === myId ? receiverId : senderId;
            
            const lastMsgText = newMessage.message || (newMessage.image ? "📷 Image" : (newMessage.voice ? "🎤 Voice Message" : ""));
            const lastMsgTime = newMessage.createdAt || new Date().toISOString();

            const index = state.otherUsers.findIndex(u => u._id === otherUserId);
            if (index !== -1) {
                const user = state.otherUsers[index];
                const updatedUser = { 
                    ...user, 
                    lastMessage: lastMsgText,
                    lastMessageTime: lastMsgTime
                };
                
                if (senderId !== myId && currentChatId !== otherUserId) {
                    updatedUser.unreadCount = (updatedUser.unreadCount || 0) + 1;
                }
                
                state.otherUsers.splice(index, 1);
                state.otherUsers.unshift(updatedUser);
            } else if (typeof newMessage.sender === 'object' && newMessage.sender?._id) {
                const newSender = {
                    ...newMessage.sender,
                    lastMessage: lastMsgText,
                    lastMessageTime: lastMsgTime,
                    unreadCount: (senderId !== myId && currentChatId !== otherUserId) ? 1 : 0
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
    
    updateSidebarOnMessage,

    setOnlineUsers,
    
    setSocketConnected

} = userSlice.actions;

export default userSlice.reducer;