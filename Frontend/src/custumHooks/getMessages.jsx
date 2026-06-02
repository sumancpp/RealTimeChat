import axios from "axios";

import { useEffect } from "react";

import { serverUrl } from "../main";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    setMessages,
    addMessage,
    updateSeenMessages,
    clearMessages
} from "../redux/messageSlice";

import {
    getSocket
} from "../socket";

const getMessages = () => {

    const dispatch =
        useDispatch();

    const {
        selectedUser,
        userData
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

                    const result =
                        await axios.get(

                            `${serverUrl}/message/get/${selectedUser._id}`,

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
        selectedUser,
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
        selectedUser
    ]);

    // REALTIME MESSAGE
    useEffect(() => {

        const socket =
            getSocket();

        if (
            !socket ||
            !selectedUser ||
            !userData
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

                const currentChatId =
                    selectedUser._id;

                const myId =
                    userData._id;

                const belongsToCurrentChat =

                    (
                        senderId?.toString() ===
                        currentChatId?.toString()

                        &&

                        receiverId?.toString() ===
                        myId?.toString()
                    )

                    ||

                    (
                        senderId?.toString() ===
                        myId?.toString()

                        &&

                        receiverId?.toString() ===
                        currentChatId?.toString()
                    );

                if (
                    belongsToCurrentChat
                ) {

                    dispatch(
                        addMessage(
                            newMessage
                        )
                    );

                }
                else {

                    // NOTIFICATION ONLY

                    if (

                        Notification.permission ===
                        "granted"

                    ) {

                        new Notification(

                            "BaatCheet",

                            {

                                body:

                                    newMessage.message ||

                                    "📷 Image Received",

                                icon:
                                    "/logo.png"

                            }

                        );

                    }

                }

            };

        socket.on(
            "newMessage",
            handleNewMessage
        );

        return () => {

            socket.off(
                "newMessage",
                handleNewMessage
            );

        };

    }, [
        selectedUser,
        userData,
        dispatch
    ]);

};

export default getMessages;