import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
