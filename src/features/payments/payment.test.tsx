import { render, fireEvent } from "@testing-library/react-native";
import PaymentFormScreen from "./payment-form-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({
          then: (resolve: any) => resolve({ data: [], error: null }),
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

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

jest.mock("@/features/policies/policy.queries", () => ({
  fetchPolicies: () => Promise.resolve([{ id: "1", clients: { name: "Test" }, premium: 100 }]),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("PaymentFormScreen", () => {
  it("shows validation error when amount is empty", () => {
    const { getByText, queryByText } = render(<PaymentFormScreen />);
    fireEvent.press(getByText(/create payment/i));
    expect(queryByText(/required/i)).toBeTruthy();
  });
});
