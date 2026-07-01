import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for typical scenario
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  it('throws an error if used outside AuthProvider', () => {
    // Suppress console.error since we expect an error to be thrown
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('provides initial loading state and handles unauthenticated user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Initial state check - the hook initializes loading to true
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAdmin).toBe(false);

    // Wait for the getSession promise to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('provides authenticated user state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAdmin).toBe(false); // not admin by default
  });

  it('identifies admin user', async () => {
    const mockUser = { id: 'admin123', email: 'admin@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The admin check happens after getting the session
    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('handles sign in', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await act(async () => {
      return await result.current.signIn('test@example.com', 'password123');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response.error).toBeNull();
  });

  it('handles sign up', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await act(async () => {
      return await result.current.signUp('test@example.com', 'password123', 'Test User');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      password: 'password123',
      options: expect.objectContaining({
        data: { full_name: 'Test User' }
      })
    }));
    expect(response.error).toBeNull();
  });

  it('handles sign out', async () => {
    (supabase.auth.signOut as any).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('updates state when auth state changes', async () => {
    let authStateCallback: any = null;

    // Capture the callback passed to onAuthStateChange
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Set initial session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();

    // Trigger auth state change
    const mockUser = { id: 'user123', email: 'changed@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    await act(async () => {
      authStateCallback('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  it('clears admin status when user signs out', async () => {
    let authStateCallback: any = null;

    // Capture the callback
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Start with admin session
    const mockUser = { id: 'admin123', email: 'admin@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });

    // Trigger auth state change to sign out
    await act(async () => {
      authStateCallback('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});
