import { render, screen } from "@testing-library/react-native";
import { AuthGate } from "./auth-gate";

describe("AuthGate", () => {
  it("renders auth when signed out", () => {
    render(<AuthGate isSignedIn={false} />);

    expect(screen.getByRole("header", { name: "Log in" })).toBeTruthy();
  });

  it("renders dashboard when signed in", () => {
    render(<AuthGate isSignedIn />);

    expect(
      screen.getByRole("header", { name: "Premium follow-up workspace" })
    ).toBeTruthy();
  });
});
