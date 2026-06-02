import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({

    name: "message",

    initialState: {

        messages: []

    },

    reducers: {

    setMessages: (state, action) => {
        state.messages = action.payload;
    },

    addMessage: (state, action) => {
        state.messages.push(action.payload);
    },

    updateSeenMessages: (state, action) => {

        state.messages =
            state.messages.map(
                (msg) => {

                    if (
                        msg.sender?.toString() ===
                        action.payload?.toString()
                    ) {

                        return {
                            ...msg,
                            isSeen: true
                        };

                    }

                    return msg;

                }
            );

    },

    clearMessages: (state) => {
        state.messages = [];
    }

}

});

export const {
    setMessages,
    addMessage,
    updateSeenMessages,
    clearMessages
} = messageSlice.actions;

export default messageSlice.reducer;