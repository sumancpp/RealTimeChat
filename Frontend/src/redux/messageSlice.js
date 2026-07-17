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

        replaceMessageRedux: (state, action) => {
            const { tempId, realMessage } = action.payload;
            if (Array.isArray(state.messages)) {
                // Find the temporary message index
                const tempIndex = state.messages.findIndex(msg => msg._id === tempId);
                
                // Check if the real message was already added by the socket listener
                const realExistsIndex = state.messages.findIndex(msg => msg._id === realMessage._id);

                if (realExistsIndex !== -1) {
                    // Socket beat the HTTP response. The real message is already here.
                    // Just remove the temporary message.
                    if (tempIndex !== -1) {
                        state.messages.splice(tempIndex, 1);
                    }
                } else {
                    // HTTP response beat the socket.
                    if (tempIndex !== -1) {
                        // Swap temp with real in place to maintain scroll position
                        state.messages[tempIndex] = realMessage;
                    } else {
                        // Fallback
                        state.messages.push(realMessage);
                    }
                }
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

    removeMessageRedux,

    replaceMessageRedux

} = messageSlice.actions;

export default messageSlice.reducer;