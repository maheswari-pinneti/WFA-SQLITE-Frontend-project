import { socket } from './socket';

export const subscribeToAttendance = (onUpdate: (data: any) => void) => {
  socket.on('attendance-update', onUpdate);
  return () => {
    socket.off('attendance-update', onUpdate);
  };
};

export const emitAttendanceCheckIn = (data: { employeeId: string; organizationId: string; checkInTime: string }) => {
  socket.emit('employee-check-in', data);
};
