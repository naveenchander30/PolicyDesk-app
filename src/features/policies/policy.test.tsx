import { render, fireEvent } from "@testing-library/react-native";
import PolicyFormScreen from "./policy-form-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
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
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: jest.fn(),
  };
});

jest.mock("@/features/clients/client.queries", () => ({
  fetchClients: () => Promise.resolve([{ id: "1", name: "Test Client" }]),
}));

jest.mock("@/features/insurance-types/insurance-type.queries", () => ({
  fetchInsuranceTypes: () => Promise.resolve([{ id: "1", name: "Health" }]),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("PolicyFormScreen", () => {
  it("shows validation error when required fields missing", () => {
    const { getByText, queryByText } = render(<PolicyFormScreen />);
    fireEvent.press(getByText(/create/i));
    expect(queryByText(/required/i)).toBeTruthy();
  });
});
