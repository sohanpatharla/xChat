// // socket.js
// import { io } from "socket.io-client";

// const options = {
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   // autoConnect: true,
//   // transports: ['websocket'],
//   reconnection: true
// };

// const socket = io(process.env.REACT_APP_BACKEND_URL, options);

// export const initSocket = () => {
//   return socket;
// };

// import { io } from 'socket.io-client';

// export const initSocket = () => {
//     return io(process.env.REACT_APP_BACKEND_URL, {
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         autoConnect: true,
//         transports: ['websocket'],
//         reconnection: true
//     });
// };
// socket.js
import { io } from 'socket.io-client';

let socketInstance = null;

export const initSocket = () => {
    if (!socketInstance) {
        const options = {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            // autoConnect: true,
            // transports: ['websocket'],
            reconnection: true
        };

        socketInstance = io(process.env.REACT_APP_BACKEND_URL, options);
    }
    return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};