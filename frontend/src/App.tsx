import React from 'react';
import { AppProvider } from './app/providers/AppProvider';
import { AppRoutes } from './app/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;
