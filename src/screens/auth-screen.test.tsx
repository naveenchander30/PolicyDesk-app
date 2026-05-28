import { fireEvent, render, screen } from "@testing-library/react-native";
import { AuthScreen } from "./auth-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe("AuthScreen", () => {
  it("renders login controls", () => {
    render(<AuthScreen />);

    expect(screen.getByRole("header", { name: "Log in" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
  });

  it("shows validation messages when submitted empty", () => {
    render(<AuthScreen />);

    fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Email is required.")).toBeTruthy();
    expect(screen.getByText("Password is required.")).toBeTruthy();
  });
});
