/**
 * Handles real-time socket events for the core Attendance module.
 * Broadcasts events to appropriate organization/department/team rooms.
 */
export const handleAttendanceEvents = (socket, io) => {
  // Listen for client-side check-ins and broadcast to the organization room
  socket.on('attendance:check-in', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('attendance:check-in', data);
    io.to(`org-${orgId}`).emit('attendance:updated', data);
  });

  // Listen for client-side check-outs
  socket.on('attendance:check-out', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('attendance:check-out', data);
    io.to(`org-${orgId}`).emit('attendance:updated', data);
  });

  // Handle corrections submitted by staff
  socket.on('attendance:correction', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('attendance:correction', data);
  });
};

