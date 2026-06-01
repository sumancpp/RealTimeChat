import { io } from "socket.io-client";

export let socket = null;

export const connectSocket = (
    userId
) => {

    if (
        socket?.connected
    ) return;

    socket = io(
        "https://realtimechat-backend-97ae.onrender.com",
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
