import { apiClient } from '../../services/api';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  team: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  department: string;
  team: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  points: number;
  updatedAt: string;
}

const unwrap = <T,>(response: { data?: { success?: boolean; data?: T; message?: string } }): T => {
  if (response.data?.success && response.data.data !== undefined) return response.data.data;
  throw new Error(response.data?.message || 'Unable to load workforce data.');
};

export const workforceApi = {
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return unwrap(await apiClient.get('/v1/leave-requests'));
  },
  async createLeaveRequest(payload: Pick<LeaveRequest, 'type' | 'startDate' | 'endDate' | 'reason'>): Promise<LeaveRequest> {
    return unwrap(await apiClient.post('/v1/leave-requests', payload));
  },
  async reviewLeaveRequest(id: string, status: 'APPROVED' | 'REJECTED', reviewComment = ''): Promise<LeaveRequest> {
    return unwrap(await apiClient.put(`/v1/leave-requests/${id}`, { status, reviewComment }));
  },
  async getTasks(): Promise<Task[]> {
    return unwrap(await apiClient.get('/v1/tasks'));
  },
  async updateTask(id: string, status: Task['status']): Promise<Task> {
    return unwrap(await apiClient.put(`/v1/tasks/${id}`, { status }));
  }
};
