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

    // FETCH CHAT
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

                                withCredentials:
                                    true

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

    // MESSAGE SEEN
    useEffect(() => {

        const socket =
            getSocket();

        if (
            !socket ||
            !selectedUser
        ) return;

        socket.on(

            "messagesSeen",

            () => {

                dispatch(

                    updateSeenMessages(

                        selectedUser._id

                    )

                );

            }

        );

        return () => {

            socket.off(
                "messagesSeen"
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

                console.log(
                    "NEW MESSAGE:",
                    newMessage
                );

                // SHOW NOTIFICATION ONLY
                // IF CHAT IS NOT OPEN

                const belongsToCurrentChat =

                    (
                        newMessage.sender?.toString() ===
                        selectedUser._id?.toString()

                        &&

                        newMessage.receiver?.toString() ===
                        userData._id?.toString()
                    )

                    ||

                    (

                        newMessage.sender?.toString() ===
                        userData._id?.toString()

                        &&

                        newMessage.receiver?.toString() ===
                        selectedUser._id?.toString()

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

                    // NOTIFICATION
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