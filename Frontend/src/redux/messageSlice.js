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

        markMessagesSeen: (state) => {

            state.messages =
                state.messages.map(
                    (msg) => ({

                        ...msg,

                        isSeen: true

                    })
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

    markMessagesSeen,

    clearMessages

} = messageSlice.actions;

export default messageSlice.reducer;