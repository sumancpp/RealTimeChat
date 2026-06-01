import { io } from "socket.io-client";

export let socket = null;

export const connectSocket = (
    userId
) => {

    if (
        socket?.connected
    ) return;

    socket = io(
        "http://localhost:8000",
        {

            query: {
                userId
            },

            transports: [
                "websocket"
            ]

        }
    );

};

export const disconnectSocket =
    () => {

        if (socket) {

            socket.disconnect();

            socket = null;

        }

    };