import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({

    name: "message",

    initialState: {

        messages: []

    },

    reducers: {

        setMessages: (
            state,
            action
        ) => {

            state.messages =
                action.payload;

        },

        addMessage: (
            state,
            action
        ) => {

            const exists = state.messages.find(msg => msg._id === action.payload._id);
            if (!exists) {
                state.messages.push(
                    action.payload
                );
            }

        },

        updateSeenMessages: (
            state,
            action
        ) => {
            if (Array.isArray(state.messages)) {
                state.messages =
                    state.messages.map(
                        (msg) => {

                            if (
                                msg.sender?.toString() !==
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
            }
        },

        updateReaction: (
            state,
            action
        ) => {
            if (Array.isArray(state.messages)) {
                state.messages =
                    state.messages.map(
                        (msg) => {

                            if (

                                msg._id ===
                                action.payload._id

                            ) {

                                return action.payload;

                            }

                            return msg;

                        }
                    );
            }
        },

        deleteMessageRedux: (
            state,
            action
        ) => {
            if (Array.isArray(state.messages)) {
                state.messages =
                    state.messages.map(
                        (msg) => {

                            if (

                                msg._id ===
                                action.payload

                            ) {

                                return {

                                    ...msg,

                                    isDeleted: true,

                                    message: "",

                                    image: "",

                                    replyTo: null,

                                    reactions: []

                                };

                            }

                            return msg;

                        }
                    );
            }
        },

        editMessageRedux: (state, action) => {
            if (Array.isArray(state.messages)) {
                const { messageId, newContent, editedAt } = action.payload;
                state.messages = state.messages.map(msg => {
                    if (msg._id === messageId) {
                        return {
                            ...msg,
                            message: newContent,
                            isEdited: true,
                            editedAt
                        };
                    }
                    return msg;
                });
            }
        },

        removeMessageRedux: (
            state,
            action
        ) => {
            if (Array.isArray(state.messages)) {
                state.messages = state.messages.filter(
                    msg => msg._id !== action.payload
                );
            }
        },


        clearMessages: (
            state
        ) => {

            state.messages = [];

        }

    }

});

export const {

    setMessages,

    addMessage,

    updateSeenMessages,

    updateReaction,

    deleteMessageRedux,

    clearMessages,
    
    editMessageRedux,

    removeMessageRedux

} = messageSlice.actions;

export default messageSlice.reducer;