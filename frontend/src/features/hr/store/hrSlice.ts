import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../../../shared/types/common.types';
import { hrService } from '../services/hr.service';

interface HRState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HRState = {
  employees: [],
  isLoading: false,
  error: null,
};

export const fetchEmployeesThunk = createAsyncThunk('hr/fetchEmployees', async () => {
  return await hrService.fetchEmployees();
});

export const updateEmployeeStatusThunk = createAsyncThunk(
  'hr/updateStatus',
  async ({ id, status }: { id: string; status: Employee['status'] }) => {
    return await hrService.updateStatus(id, status);
  }
);

export const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.isLoading = false;
        state.employees = action.payload;
      })
      .addCase(updateEmployeeStatusThunk.fulfilled, (state, action: PayloadAction<Employee>) => {
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      });
  },
});

export default hrSlice.reducer;
