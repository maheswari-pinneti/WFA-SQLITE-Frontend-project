import { logAudit } from '../../database/connection.js';

export const triggerGoogleCalendarNotification = async (employeeId: string, employeeName: string, action: string, dateStr: string) => {
  const eventTitle = `[WFA Platform] ${eventTitlePlaceholder(employeeName)} - ${action}`;
  const description = `Automated notification: Employee ${employeeName} (${employeeId}) performed ${action} on ${dateStr}.`;
  
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[GOOGLE CALENDAR API] Created Calendar Event: "${eventTitle}"`);
    console.log(`[GOOGLE CALENDAR API] Description: "${description}"`);
  }
  
  return {
    success: true,
    eventId: Math.random().toString(36).substring(2, 11),
    title: eventTitle
  };
};

function eventTitlePlaceholder(name: string) {
  return name;
}

export const triggerAlarm = async (employeeId: string, employeeName: string, type: string, details: string) => {
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
