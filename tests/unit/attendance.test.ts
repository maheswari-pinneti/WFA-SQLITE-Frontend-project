import { describe, it, expect, beforeEach } from 'vitest';
import { attendanceService, OFFICE_COORDS, getDistance } from '../../frontend/src/services/attendance.service';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

describe('Smart Attendance Service Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Geofencing distance calculations', () => {
    it('should correctly measure distance within bounds', () => {
      const dist = getDistance(12.9716, 77.5946, 12.97165, 77.59465);
      expect(dist).toBeLessThan(100);
    });

    it('should correctly flag coordinates outside office boundary', () => {
      const dist = getDistance(12.9716, 77.5946, 12.9000, 77.5000);
      expect(dist).toBeGreaterThan(100);
    });
  });

  describe('Punch Check-In & Check-Out State Transitions', () => {
    const empInfo = {
      employeeId: 'emp-999',
      employeeName: 'John Doe',
      department: 'Engineering & Technology',
      shiftType: 'Regular' as const,
      workMode: 'Office' as const,
      latitude: OFFICE_COORDS.lat,
      longitude: OFFICE_COORDS.lng
    };

    it('should allow normal check-in and check-out transition', () => {
      const checkedIn = attendanceService.checkIn(empInfo);
      expect(checkedIn.status).toBe('Checked In');
      expect(checkedIn.checkOutTime).toBeNull();

      attendanceService.checkOut('emp-999');
      const records = attendanceService.getRecords();
      expect(records[0].status).toBe('Checked Out');
      expect(records[0].checkOutTime).not.toBeNull();
    });

    it('should reject duplicate check-in attempts', () => {
      attendanceService.checkIn(empInfo);
      expect(() => {
        attendanceService.checkIn(empInfo);
      }).toThrowError('Active session already exists. Must check out first.');
    });

    it('should reject check-out before check-in', () => {
      expect(() => {
        attendanceService.checkOut('emp-unregistered');
      }).toThrowError('Check-out-before-check-in rejection. No active session found.');
    });

    it('should support take break and resume cycle', () => {
      attendanceService.checkIn(empInfo);
      attendanceService.takeBreak('emp-999');
      
      let records = attendanceService.getRecords();
      expect(records[0].status).toBe('On Break');
      expect(records[0].breaks[0].end).toBeNull();

      attendanceService.resumeWork('emp-999');
      records = attendanceService.getRecords();
      expect(records[0].status).toBe('Working');
      expect(records[0].breaks[0].end).not.toBeNull();
    });
  });

  describe('Geofencing Access Enforcements', () => {
    it('should reject check-in if coordinates are missing for In-Office mode', () => {
      expect(() => {
        attendanceService.checkIn({
          employeeId: 'emp-geofence',
          employeeName: 'Jane Smith',
          department: 'HR Ops',
          shiftType: 'Regular',
          workMode: 'Office'
        });
      }).toThrowError('Location permissions are required for In-Office check-in.');
    });

    it('should reject check-in if coordinates are outside Bengaluru office radius', () => {
      expect(() => {
        attendanceService.checkIn({
          employeeId: 'emp-geofence-2',
          employeeName: 'Jane Smith',
          department: 'HR Ops',
          shiftType: 'Regular',
          workMode: 'Office',
          latitude: 12.9000,
          longitude: 77.5000
        });
      }).toThrowError(/Geofencing validation failed/);
    });

    it('should allow check-in if coordinates are within office bounds', () => {
      const record = attendanceService.checkIn({
        employeeId: 'emp-geofence-3',
        employeeName: 'Jane Smith',
        department: 'HR Ops',
        shiftType: 'Regular',
        workMode: 'Office',
        latitude: OFFICE_COORDS.lat,
        longitude: OFFICE_COORDS.lng
      });
      expect(record.status).toBe('Checked In');
    });
  });

  describe('Calculate working hours, breaks, and late status', () => {
    it('should correctly flag late arrival on regular shift', () => {
      const dummyRecord = {
        id: '1',
        employeeId: 'emp-1',
        employeeName: 'Emp 1',
        department: 'Engineering',
        date: '2026-08-05',
        checkInTime: '2026-08-05T09:30:00Z', // 9:30 AM is late (target 9:00 - 9:15 AM)
        checkOutTime: '2026-08-05T18:00:00Z',
        breaks: [],
        shiftType: 'Regular' as const,
        workMode: 'Office' as const,
        status: 'Checked Out' as const
      };

      const stats = attendanceService.calculateHours(dummyRecord);
      expect(stats.lateArrival).toBe(true);
      expect(stats.workingHours).toBe(8.5);
    });

    it('should calculate accurate working hours and overtime', () => {
      const dummyRecord = {
        id: '1',
        employeeId: 'emp-1',
        employeeName: 'Emp 1',
        department: 'Engineering',
        date: '2026-08-05',
        checkInTime: '2026-08-05T09:00:00Z',
        checkOutTime: '2026-08-05T18:00:00Z', // 9 hours total session
        breaks: [{ start: '2026-08-05T13:00:00Z', end: '2026-08-05T14:00:00Z' }], // 1 hour break
        shiftType: 'Regular' as const,
        workMode: 'Office' as const,
        status: 'Checked Out' as const
      };

      const stats = attendanceService.calculateHours(dummyRecord);
      expect(stats.workingHours).toBe(8.0);
      expect(stats.breakDuration).toBe(1.0);
      expect(stats.overtime).toBe(0.0);
    });
  });

  describe('Offline Queue & Synchronization', () => {
    it('should queue attendance actions offline and process them upon synchronization', () => {
      attendanceService.enqueueOfflineAction({
        type: 'CHECK_IN',
        payload: {
          employeeId: 'emp-off',
          employeeName: 'Offline User',
          department: 'Sales',
          shiftType: 'Regular',
          workMode: 'Remote'
        }
      });

      let queue = attendanceService.getOfflineQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].type).toBe('CHECK_IN');

      const result = attendanceService.syncOfflineActions();
      expect(result.syncedCount).toBe(1);

      const records = attendanceService.getRecords();
      expect(records.find((r) => r.employeeId === 'emp-off')).toBeDefined();
    });
  });
});
