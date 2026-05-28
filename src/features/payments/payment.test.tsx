import { render, fireEvent, screen } from "@testing-library/react-native";
import PaymentFormScreen from "./payment-form-screen";

const mockGoBack = jest.fn();

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({
          then: (resolve: (value: unknown) => void) => resolve({ data: [], error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "1" }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: jest.fn(),
  };
});

jest.mock("@/features/policies/policy.queries", () => ({
  fetchPolicies: () => Promise.resolve([{ id: "1", clients: { name: "Test" }, premium: 100 }]),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("PaymentFormScreen", () => {
  beforeEach(() => {
    mockGoBack.mockClear();
  });

  it("shows validation error when amount is empty", () => {
    render(<PaymentFormScreen />);
    fireEvent.press(screen.getByText(/create payment/i));
    expect(screen.queryByText(/required/i)).toBeTruthy();
  });
});
