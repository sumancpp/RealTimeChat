import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({

    name: "message",

    initialState: {

        messages: []

    },

    reducers: {

        setMessages: (state, action) => {

            state.messages =
                action.payload;

        },

        addMessage: (state, action) => {

            state.messages.push(
                action.payload
            );

        },

        updateSeenMessages: (
            state,
            action
        ) => {

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

        updateReaction: (
            state,
            action
        ) => {

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

    clearMessages

} = messageSlice.actions;

export default messageSlice.reducer;