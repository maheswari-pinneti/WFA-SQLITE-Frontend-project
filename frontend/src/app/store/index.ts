import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../auth/store/authSlice';
import adminReducer from '../../features/admin/store/adminSlice';
import hrReducer from '../../features/hr/store/hrSlice';
import themeReducer from '../../store/themeSlice';
import sidebarReducer from '../../store/sidebarSlice';
import attendanceReducer from '../../store/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    hr: hrReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
