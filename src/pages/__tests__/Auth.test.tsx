import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';
import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// We can mock lucide-react if they cause rendering issues in JSDOM, but generally it's fine.
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

vi.mock('@/integrations/lovable/index', () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

import { useAuth } from '@/hooks/useAuth';

describe('Auth Component', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      user: null,
    });
  });

  it('renders login form by default', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText('ยินดีต้อนรับ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();
  });

  describe('Login Validation Errors', () => {
    it('shows error toast for invalid email format', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('อีเมล');
      const passwordInput = screen.getByLabelText('รหัสผ่าน');
      const submitButton = screen.getAllByRole('button', { name: 'เข้าสู่ระบบ' })[0];

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');

      // The button needs to be submitted inside the form
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('กรุณากรอกอีเมลที่ถูกต้อง');
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('shows error toast for short password', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('อีเมล');
      const passwordInput = screen.getByLabelText('รหัสผ่าน');
      const submitButton = screen.getAllByRole('button', { name: 'เข้าสู่ระบบ' })[0];

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'short'); // Less than 6 chars

      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('calls signIn on successful validation', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      render(
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('อีเมล');
      const passwordInput = screen.getByLabelText('รหัสผ่าน');
      const submitButton = screen.getAllByRole('button', { name: 'เข้าสู่ระบบ' })[0];

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(toast.success).toHaveBeenCalledWith('เข้าสู่ระบบสำเร็จ!');
      });
    });
  });
});
