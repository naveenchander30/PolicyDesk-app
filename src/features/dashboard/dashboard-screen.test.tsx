import { render, screen, waitFor } from "@testing-library/react-native";
import DashboardScreen from "./dashboard-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({ then: (resolve: (value: unknown) => void) => resolve({ count: 0, error: null }) }),
          then: (resolve: (value: unknown) => void) => resolve({ count: 0, error: null }),
        }),
        then: (resolve: (value: unknown) => void) => resolve({ count: 0, error: null }),
      }),
    }),
    auth: { signOut: jest.fn() },
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("DashboardScreen", () => {
  it("renders stat cards after loading", async () => {
    render(<DashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText("Total Clients")).toBeTruthy();
      expect(screen.getByText("Active Policies")).toBeTruthy();
      expect(screen.getByText("Pending Payments")).toBeTruthy();
      expect(screen.getByText("Paid This Month")).toBeTruthy();
    });
  });

  it("shows sign out button", async () => {
    render(<DashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeTruthy();
    });
  });
});
