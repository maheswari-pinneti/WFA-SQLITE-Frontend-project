import { ModelShim } from './modelShim.js';

export const Attendance = new ModelShim('attendancerecords');
export const Correction = new ModelShim('correctionrequests');
export const BreakSession = new ModelShim('breaksessions');
export const AttendanceEvent = new ModelShim('attendanceevents');
export const IdempotencyRecord = new ModelShim('idempotencyrecords');

export default Attendance;
