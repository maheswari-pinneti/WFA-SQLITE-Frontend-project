export const handleNotificationEvents = (socket, io) => {
  socket.on('send-notification', (data) => {
    io.to(`user-${data.userId}`).emit('new-notification', data);
  });
};
