import { ModelShim } from './modelShim.js';

export const Organization = new ModelShim('companies');
export const Department = new ModelShim('departments');
export const Team = new ModelShim('teams');
export const Shift = new ModelShim('shifts');
export const Skill = new ModelShim('skills');
export const PerformanceRecord = new ModelShim('performancerecords');
export const Task = new ModelShim('tasks');
export const LeaveRequest = new ModelShim('leaverequests');
export const Notification = new ModelShim('notifications');

export default Department;
