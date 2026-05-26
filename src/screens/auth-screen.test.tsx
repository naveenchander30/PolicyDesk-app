import { fireEvent, render, screen } from "@testing-library/react-native";
import { AuthScreen } from "./auth-screen";

describe("AuthScreen", () => {
  it("renders login controls", () => {
    render(<AuthScreen mode="login" />);

    expect(screen.getByRole("header", { name: "Log in" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
  });

  it("renders signup controls", () => {
    render(<AuthScreen mode="signup" />);

    expect(screen.getByRole("header", { name: "Create account" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
  });

  it("shows validation messages when submitted empty", () => {
    render(<AuthScreen mode="login" />);

    fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Email is required.")).toBeTruthy();
    expect(screen.getByText("Password is required.")).toBeTruthy();
  });
});
