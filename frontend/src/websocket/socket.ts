import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (userId: string, orgId: string) => {
  socket.connect();
  socket.emit('join-room', `user-${userId}`);
  socket.emit('join-room', `org-${orgId}`);
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
