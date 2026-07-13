import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({

    name: "user",

    initialState: {

        userData: null,

        otherUsers: [],

        selectedUser: null,

        onlineUsers: []

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
                state.otherUsers[index] = { ...state.otherUsers[index], ...action.payload };
            }
        },

        setOnlineUsers: (state, action) => {

            state.onlineUsers =
                action.payload;

        }

    }

});

export const {

    setUserData,

    setOtherUsers,

    setSelectedUser,
    
    updateOtherUser,

    setOnlineUsers

} = userSlice.actions;

export default userSlice.reducer;