import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ForYouFeed } from '../components/recommendations/ForYouFeed';
import { SmartReorder } from '../components/recommendations/SmartReorder';
import AiConcierge from '../pages/AiConcierge';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Stub out Framer Motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>,
      section: ({ children, className }: { children: React.ReactNode, className?: string }) => <section className={className}>{children}</section>,
      h2: ({ children, className }: { children: React.ReactNode, className?: string }) => <h2 className={className}>{children}</h2>,
      p: ({ children, className }: { children: React.ReactNode, className?: string }) => <p className={className}>{children}</p>,
      form: ({ children, className, onSubmit }: { children: React.ReactNode, className?: string, onSubmit?: React.FormEventHandler }) => <form className={className} onSubmit={onSubmit}>{children}</form>,
      button: ({ children, className, onClick, type }: { children: React.ReactNode, className?: string, onClick?: React.MouseEventHandler, type?: "button" | "submit" | "reset" }) => <button type={type} className={className} onClick={onClick}>{children}</button>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Suppress act() warnings for setup
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: An update to.*inside a test was not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const queryClient = new QueryClient();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Phase 2 Recommendations', () => {
  it('renders ForYouFeed components successfully', () => {
    render(<ForYouFeed />, { wrapper: TestWrapper });
    expect(screen.getByText(/AI แนะนำสำหรับคุณ/)).toBeInTheDocument();
  });

  it('renders SmartReorder components successfully', () => {
    render(<SmartReorder />, { wrapper: TestWrapper });
    expect(screen.getByText(/สั่งซื้ออีกครั้ง/)).toBeInTheDocument();
  });
});

describe('Phase 2 AiConcierge', () => {
  it('renders AI Concierge page successfully', () => {
    render(<AiConcierge />, { wrapper: TestWrapper });
    expect(screen.getByText(/มีอะไรให้ผมแนะนำ/)).toBeInTheDocument();
  });
});