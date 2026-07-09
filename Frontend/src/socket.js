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

    const socketUrl = import.meta.env.MODE === "development" ? "http://localhost:5000" : undefined;
    socket = io(
        socketUrl,
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