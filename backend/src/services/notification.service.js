import { logAudit } from '../config/db.js';

export const triggerGoogleCalendarNotification = async (employeeId, employeeName, action, dateStr) => {
  const eventTitle = `[WFA Platform] ${employeeName} - ${action}`;
  const description = `Automated notification: Employee ${employeeName} (${employeeId}) performed ${action} on ${dateStr}.`;
  
  // Simulated Google Calendar Event creation
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[GOOGLE CALENDAR API] Created Calendar Event: "${eventTitle}"`);
    console.log(`[GOOGLE CALENDAR API] Description: "${description}"`);
  }
  
  return {
    success: true,
    eventId: Math.random().toString(36).substr(2, 9),
    title: eventTitle
  };
};

export const triggerAlarm = async (employeeId, employeeName, type, details) => {
  const alertTitle = `[ALARM ALERT] ${type}`;
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`\x1b[31m${alertTitle}: ${employeeName} (${employeeId}) - ${details}\x1b[0m`);
  }
  
  logAudit(employeeId, `ALARM_${type.toUpperCase()}`, details);
  
  return {
    success: true,
    alarmLogged: true
  };
};
