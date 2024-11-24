// src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
    }

    connect() {
        if (!this.socket) {
            const options = {
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                // autoConnect: true,
                // transports: ['websocket'],
                reconnection: true
            };

            this.socket = io(process.env.REACT_APP_BACKEND_URL, options);
        }
        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    leaveRoom() {
        if (this.socket && this.currentRoom) {
            this.socket.emit('leave_room', { roomId: this.currentRoom });
            this.currentRoom = null;
        }
    }

    joinRoom(roomId) {
        if (this.currentRoom) {
            this.leaveRoom();
        }
        this.currentRoom = roomId;
    }

    disconnect() {
        if (this.socket) {
            this.leaveRoom();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();