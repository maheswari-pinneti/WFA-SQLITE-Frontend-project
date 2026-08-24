import { io, Socket } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5001` : 'http://localhost:5001';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (token: string, userId: string, orgId: string) => {
  socket.auth = { token };
  socket.connect();
  socket.emit('join-room', `user-${userId}`);
  socket.emit('join-room', `org-${orgId}`);
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
