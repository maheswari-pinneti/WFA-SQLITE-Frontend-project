import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
}

const savedCollapsed = localStorage.getItem('wfa_sidebar_collapsed');

const initialState: SidebarState = {
  collapsed: savedCollapsed !== null ? JSON.parse(savedCollapsed) : false,
  mobileOpen: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
      localStorage.setItem('wfa_sidebar_collapsed', JSON.stringify(state.collapsed));
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
      localStorage.setItem('wfa_sidebar_collapsed', JSON.stringify(action.payload));
    },
    toggleMobileOpen: (state) => {
      state.mobileOpen = !state.mobileOpen;
    },
    setMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileOpen = action.payload;
    },
  },
});

export const { toggleCollapsed, setCollapsed, toggleMobileOpen, setMobileOpen } = sidebarSlice.actions;
export default sidebarSlice.reducer;
