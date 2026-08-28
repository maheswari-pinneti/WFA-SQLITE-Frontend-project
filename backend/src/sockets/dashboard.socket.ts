/**
 * Handles real-time dashboard analytics KPI socket event updates.
 */
export const handleDashboardEvents = (socket, io) => {
  // Trigger real-time dashboard state changes
  socket.on('dashboard:kpi-updated', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('dashboard:kpi-updated', data);
  });

  socket.on('dashboard:workforce-updated', (data) => {
    const orgId = data.organizationId || 'org-stackly';
    io.to(`org-${orgId}`).emit('dashboard:workforce-updated', data);
  });
};
