import axios from "axios";

import { useEffect } from "react";

import { serverUrl } from "../config";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    setMessages,
    addMessage,
    updateSeenMessages,
    clearMessages,
    editMessageRedux
} from "../redux/messageSlice";

import {
    getSocket
} from "../socket";

import {
    updateSidebarOnMessage,
    setSelectedUser
} from "../redux/userSlice";

const getMessages = () => {

    const dispatch =
        useDispatch();

    const {
        selectedUser,
        userData,
        isSocketConnected
    } = useSelector(
        (state) => state.user
    );

    // FETCH MESSAGES
    useEffect(() => {

        if (
            !selectedUser?._id
        ) {

            dispatch(
                clearMessages()
            );

            return;

        }

        const fetchMessages =
            async () => {

                try {

                    const endpoint = selectedUser.isGroup ? `${serverUrl}/group/messages/${selectedUser._id}` : `${serverUrl}/message/get/${selectedUser._id}`;
                    const result =
                        await axios.get(

                            endpoint,

                            {
                                withCredentials: true
                            }

                        );

                    dispatch(
                        setMessages(
                            result.data
                        )
                    );

                } catch (error) {

                    console.log(
                        error
                    );

                }

            };

        fetchMessages();

    }, [
        selectedUser?._id,
        dispatch
    ]);

    // SEEN EVENT
    useEffect(() => {

        const socket =
            getSocket();

        if (
            !socket ||
            !selectedUser
        ) return;

        const handleSeen =
            () => {

                dispatch(
                    updateSeenMessages(
                        selectedUser._id
                    )
                );

            };

        socket.on(
            "messagesSeen",
            handleSeen
        );

        return () => {

            socket.off(
                "messagesSeen",
                handleSeen
            );

        };

    }, [
        dispatch,
        selectedUser?._id
    ]);

    // REALTIME MESSAGE
    useEffect(() => {

        const socket =
            getSocket();

        if (
            !socket ||
            !userData ||
            !isSocketConnected
        ) return;

        const handleNewMessage =
            (newMessage) => {

                const senderId =

                    typeof newMessage.sender ===
                    "object"

                        ? newMessage.sender._id

                        : newMessage.sender;

                const receiverId =

                    typeof newMessage.receiver ===
                    "object"

                        ? newMessage.receiver._id

                        : newMessage.receiver;

                const currentChatId = selectedUser?._id;
                const myId = userData?._id;

                const belongsToCurrentChat =
                    (
                        senderId?.toString() === currentChatId?.toString() &&
                        receiverId?.toString() === myId?.toString()
                    ) ||
                    (
                        senderId?.toString() === myId?.toString() &&
                        receiverId?.toString() === currentChatId?.toString()
                    );

                if (belongsToCurrentChat) {
                    dispatch(addMessage(newMessage));
                } else {
                    if (Notification.permission === "granted") {
                        new Notification(
                            "BaatCheet",
                            {
                                body: newMessage.message || "📷 Image Received",
                                icon: "/logo.png"
                            }
                        );
                    }
                }

                // UPDATE SIDEBAR FOR THIS MESSAGE
                dispatch(updateSidebarOnMessage({
                    newMessage,
                    myId,
                    currentChatId
                }));
            };

        socket.on("newMessage", handleNewMessage);
        
        const handleNewGroupMessage = (newMessage) => {
             if (selectedUser?.isGroup && newMessage.groupId === selectedUser?._id) {
                 dispatch(addMessage(newMessage));
             } else {
                 if (Notification.permission === "granted") {
                     new Notification("BaatCheet Group", {
                         body: newMessage.message || "📷 Image Received",
                         icon: "/logo.png"
                     });
                 }
             }
        };

        socket.on("newGroupMessage", handleNewGroupMessage);

        const handleMessageEdited = (payload) => {
             dispatch(editMessageRedux(payload));
        };

        socket.on("messageEdited", handleMessageEdited);

        return () => {

            socket.off(
                "newMessage",
                handleNewMessage
            );
            
            socket.off(
                "newGroupMessage",
                handleNewGroupMessage
            );

            socket.off(
                "messageEdited",
                handleMessageEdited
            );

        };

    }, [
        selectedUser?._id,
        userData?._id,
        isSocketConnected,
        dispatch
    ]);

};

export default getMessages;