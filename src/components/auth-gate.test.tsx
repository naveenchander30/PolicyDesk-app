import { render, screen, waitFor } from "@testing-library/react-native";
import { AuthGate } from "./auth-gate";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  }),
}));

jest.mock("@/navigation/app-navigator", () => ({
  __esModule: true,
  default: () => null,
}));

describe("AuthGate", () => {
  it("renders auth when signed out", async () => {
    render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByRole("header", { name: "Log in" })).toBeTruthy();
    });
  });
});
