import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Auth from "./Auth";
import { toast } from "sonner";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock hooks and libraries
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    user: null,
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn(),
    }
  }
}));

// Mock the Tabs component to ignore Radix UI complexities for testing form behavior
vi.mock("@/components/ui/tabs", () => {
  return {
    Tabs: ({ children, defaultValue }: unknown) => <div data-testid="tabs">{children}</div>,
    TabsList: ({ children }: unknown) => <div>{children}</div>,
    TabsTrigger: ({ children, value }: unknown) => (
      <button data-testid={`tab-${value}`} onClick={() => {}}>
        {children}
      </button>
    ),
    TabsContent: ({ children, value }: unknown) => (
      <div data-testid={`content-${value}`}>{children}</div>
    ),
  };
});

describe("Auth Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuth = () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
  };

  it("shows an error toast when signup fails validation (invalid email)", async () => {
    renderAuth();

    const emailInput = document.getElementById('signup-email') as HTMLInputElement;
    const passwordInput = document.getElementById('signup-password') as HTMLInputElement;

    // In our mocked setup, both tabs are always rendered, we just need to find the correct form
    const signupForm = emailInput.closest('form') as HTMLFormElement;

    // Input invalid data
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    fireEvent.submit(signupForm);

    // Verify error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("กรุณากรอกอีเมลที่ถูกต้อง");
    });
  });

  it("shows an error toast when signup fails validation (short password)", async () => {
    renderAuth();

    const emailInput = document.getElementById('signup-email') as HTMLInputElement;
    const passwordInput = document.getElementById('signup-password') as HTMLInputElement;

    const signupForm = emailInput.closest('form') as HTMLFormElement;

    // Input invalid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });

    // Submit form
    fireEvent.submit(signupForm);

    // Verify error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    });
  });
});
