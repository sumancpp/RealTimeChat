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


const getMessages = () => {

    const dispatch = useDispatch();

   const {
    selectedUser,
    socket
} = useSelector(
    (state) => state.user
);

    // FETCH CHAT
    useEffect(() => {

        if (!selectedUser?._id) {

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

    useEffect(() => {

    if (!socket) return;

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

}, [dispatch, socket, selectedUser]);

    // SOCKET LISTENER
    useEffect(() => {

        if (
            !socket ||
            !selectedUser
        ) return;

        const handleNewMessage =
            (newMessage) => {

                const isCurrentChat =

    (
        newMessage.sender?.toString() ===
        selectedUser._id?.toString()
    )

    ||

    (
        newMessage.receiver?.toString() ===
        selectedUser._id?.toString()
    );

                if (
                    isCurrentChat
                ) {

                    dispatch(
                        addMessage(
                            newMessage
                        )
                    );

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
        dispatch
    ]);

};

export default getMessages;