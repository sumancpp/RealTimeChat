import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({

    name: "message",

    initialState: {
        messages: [],
        chatCache: {},
        loadingChat: false
    },

    reducers: {
        setMessages: (state, action) => {
            if (action.payload && typeof action.payload === "object" && action.payload.chatId) {
                const { chatId, messages: serverMsgs } = action.payload;
                
                // Retrieve existing local messages from cache and localStorage
                let localMsgs = state.chatCache[chatId] || [];
                if (!localMsgs || localMsgs.length === 0) {
                    try {
                        const raw = localStorage.getItem(`chat_cache_${chatId}`);
                        if (raw) localMsgs = JSON.parse(raw);
                    } catch (e) {}
                }

                // Preserve all offline-generated messages so they are never wiped out
                const offlineMsgs = (localMsgs || []).filter(m => 
                    m && m._id && (String(m._id).startsWith("offline-") || m.isOfflineGenerated)
                );

                const mergedMap = new Map();
                (serverMsgs || []).forEach(m => {
                    if (m && m._id) mergedMap.set(m._id, m);
                });
                offlineMsgs.forEach(m => {
                    if (m && m._id && !mergedMap.has(m._id)) {
                        mergedMap.set(m._id, m);
                    }
                });

                const finalMessages = Array.from(mergedMap.values()).sort((a, b) => 
                    new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );

                state.chatCache[chatId] = finalMessages;
                state.messages = finalMessages;
                try {
                    localStorage.setItem(`chat_cache_${chatId}`, JSON.stringify(finalMessages));
                } catch (e) {}
            } else {
                state.messages = Array.isArray(action.payload) ? action.payload : [];
            }
            state.loadingChat = false;
        },

        switchChat: (state, action) => {
            const chatId = action.payload;
            if (chatId && state.chatCache[chatId]) {
                state.messages = state.chatCache[chatId];
                state.loadingChat = false;
            } else if (chatId) {
                try {
                    const localCached = localStorage.getItem(`chat_cache_${chatId}`);
                    if (localCached) {
                        const parsed = JSON.parse(localCached);
                        state.chatCache[chatId] = parsed;
                        state.messages = parsed;
                        state.loadingChat = false;
                        return;
                    }
                } catch (e) {}
                state.messages = [];
                state.loadingChat = true;
            } else {
                state.messages = [];
                state.loadingChat = true;
            }
        },

        addMessage: (state, action) => {
            const newMsg = action.payload;
            const exists = state.messages.find(msg => msg._id === newMsg._id);
            if (!exists) {
                state.messages.push(newMsg);
                // Also update chatCache for the relevant chat
                const receiverId = typeof newMsg.receiver === "object" ? newMsg.receiver?._id : newMsg.receiver;
                const senderId = typeof newMsg.sender === "object" ? newMsg.sender?._id : newMsg.sender;
                const chatId = newMsg.groupId || receiverId || senderId;
                if (chatId) {
                    state.chatCache[chatId] = [...(state.chatCache[chatId] || []), newMsg];
                    try {
                        localStorage.setItem(`chat_cache_${chatId}`, JSON.stringify(state.chatCache[chatId]));
                    } catch (e) {}
                }
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

        revealGhostMessageRedux: (state, action) => {
            if (Array.isArray(state.messages)) {
                const { messageId, ghostRevealedAt } = action.payload;
                state.messages = state.messages.map(msg => {
                    if (msg._id === messageId) {
                        return {
                            ...msg,
                            isGhostRevealed: true,
                            ghostRevealedAt
                        };
                    }
                    return msg;
                });
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

        updateViewOnceRedux: (state, action) => {
            if (Array.isArray(state.messages)) {
                const { messageId } = action.payload;
                state.messages = state.messages.map(msg => {
                    if (msg._id === messageId) {
                        return {
                            ...msg,
                            isViewOnceOpened: true
                        };
                    }
                    return msg;
                });
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

    switchChat,

    addMessage,

    updateSeenMessages,

    updateReaction,

    deleteMessageRedux,

    clearMessages,
    
    editMessageRedux,

    removeMessageRedux,

    revealGhostMessageRedux,

    replaceMessageRedux,

    updateViewOnceRedux

} = messageSlice.actions;

export default messageSlice.reducer;