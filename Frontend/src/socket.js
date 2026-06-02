import { io } from "socket.io-client";

let socket = null;

// CONNECT SOCKET
export const connectSocket = (
    userId
) => {

    if (
        socket?.connected
    ) {

        return socket;

    }

    socket = io(
        "https://realtimechat-backend-97ae.onrender.com",
        {

            query: {
                userId
            },

            transports: [
                "websocket"
            ],

            withCredentials: true

        }
    );

    return socket;

};

// GET CURRENT SOCKET
export const getSocket = () => {

    return socket;

};

// DISCONNECT SOCKET
export const disconnectSocket =
    () => {

        if (socket) {

            socket.disconnect();

            socket = null;

        }

    };

export {
    socket
};