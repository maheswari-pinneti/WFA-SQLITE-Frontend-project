import mongoose from 'mongoose';
import 'dotenv/config';
import { connectMongoDB } from '../src/config/mongodb.js';
import { Employee } from '../src/models/Employee.js';
import { Attendance } from '../src/models/Attendance.js';
import { Task } from '../src/models/Department.js';
import { io as ioClient } from 'socket.io-client';

// Connect to Mongo
console.log('Connecting simulator to MongoDB...');
connectMongoDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Establish socket connection to the active dev/production server
const socketUrl = 'http://localhost:5000';
console.log(`Connecting Socket.IO client daemon to: ${socketUrl}`);
const socket = ioClient(socketUrl);

socket.on('connect', () => {
  console.log('⚡ Socket.IO client connected to backend server. Ready to emit live events.');
  socket.emit('join-room', 'org-stackly');
});

socket.on('connect_error', (err) => {
  console.warn(`⚠️ Socket connection failed: ${err.message}. Running database writes only.`);
});

async function runSimulationStep() {
  try {
    if (mongoose.connection.readyState !== 1) return;

    // Select a random active employee
    const employees = await Employee.find({ status: 'ACTIVE', role: { $ne: 'ADMIN' } });
    if (!employees || employees.length === 0) return;

    const emp = employees[Math.floor(Math.random() * employees.length)];
    const roll = Math.random();

    // 1. Roll for check-in simulation (40% probability)
    if (roll < 0.40) {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Check if employee already checked in today
      const row = await Attendance.findOne({ employeeId: emp.id, date: todayStr });
      if (row) return; // Skip if session exists

      const recordId = `att-${Math.random().toString(36).slice(2, 11)}`;
      const checkInTime = new Date().toISOString();
      const workMode = Math.random() < 0.3 ? 'Remote' : 'Office';

      console.log(`[SIMULATOR] Clocking IN: ${emp.name} (${emp.id}) mode: ${workMode}`);

      await Attendance.create({
        id: recordId,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: todayStr,
        checkInTime,
        checkOutTime: null,
        breaks: [],
        shiftType: 'Regular',
        workMode,
        status: 'Checked In',
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 10,
        idempotencyKey: `idemp-${recordId}`,
        team: emp.team,
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      });

      // Emit real-time events to update the dashboard instantly
      if (socket.connected) {
        socket.emit('attendance:check-in', {
          id: recordId,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: todayStr,
          checkInTime,
          workMode,
          status: 'Checked In',
          organizationId: 'org-stackly'
        });
        socket.emit('dashboard:kpi-updated', { organizationId: 'org-stackly' });
      }

    // 2. Roll for check-out simulation (30% probability)
    } else if (roll < 0.70) {
      const todayStr = new Date().toISOString().split('T')[0];

      const row = await Attendance.findOne({ employeeId: emp.id, date: todayStr, status: 'Checked In' });
      if (!row) return;

      const checkOutTime = new Date().toISOString();
      console.log(`[SIMULATOR] Clocking OUT: ${emp.name} (${emp.id})`);

      await Attendance.findOneAndUpdate(
        { id: row.id },
        { $set: { checkOutTime, status: 'Checked Out' } }
      );

      if (socket.connected) {
        socket.emit('attendance:check-out', {
          id: row.id,
          employeeId: emp.id,
          employeeName: emp.name,
          date: todayStr,
          checkOutTime,
          status: 'Checked Out',
          organizationId: 'org-stackly'
        });
        socket.emit('dashboard:kpi-updated', { organizationId: 'org-stackly' });
      }

    // 3. Roll for task update / notification simulation (30% probability)
    } else {
      const taskText = `Completed daily code sync audit iteration.`;
      console.log(`[SIMULATOR] Creating Notification Task for: ${emp.name}`);
      
      const taskId = `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await Task.create({
        id: taskId,
        title: taskText,
        assigneeId: emp.id,
        assigneeName: emp.name,
        department: emp.department,
        team: emp.team,
        organizationId: 'org-stackly',
        companyId: 'org-stackly',
        priority: 'MEDIUM',
        status: 'TODO',
        points: 10,
        updatedAt: new Date().toISOString()
      });

      if (socket.connected) {
        socket.emit('send-notification', {
          userId: emp.id,
          title: 'New Task Assigned',
          message: taskText,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Simulation step error:', error);
  }
}

// Tick interval rate (default every 5 seconds)
const intervalSeconds = 5;
console.log(`Starting real-time workday daemon loop. Ticking every ${intervalSeconds} seconds...`);
setInterval(runSimulationStep, intervalSeconds * 1000);
