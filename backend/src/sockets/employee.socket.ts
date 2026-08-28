/**
 * Handles real-time employee presence and team status update socket events.
 */
export const handleEmployeeEvents = (socket, io) => {
  // Flag client presence online
  socket.on('employee:online', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    socket.to(`org-${orgId}`).emit('employee:online', {
      userId: data.userId,
      name: data.name,
      status: 'ONLINE',
      timestamp: new Date().toISOString()
    });
  });

  // Flag client presence offline
  socket.on('employee:offline', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    socket.to(`org-${orgId}`).emit('employee:offline', {
      userId: data.userId,
      status: 'OFFLINE',
      timestamp: new Date().toISOString()
    });
  });

  // Track status modifications (e.g. shift modes, breaks, pto)
  socket.on('employee:status-changed', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('employee:status-changed', data);
  });

  // Broad log updates of actions completed within teams
  socket.on('team:activity', (data) => {
    const teamId = data.teamId || data.team;
    if (teamId) {
      socket.to(`team-${teamId}`).emit('team:activity', data);
    }
  });
};
