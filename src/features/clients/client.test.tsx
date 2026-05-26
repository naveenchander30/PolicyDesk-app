import { render, fireEvent } from "@testing-library/react-native";
import ClientFormScreen from "./client-form-screen";

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
          single: () => Promise.resolve({ data: { id: "1", name: "Test" }, error: null }),
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

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("ClientFormScreen", () => {
  it("shows validation error when name is empty", () => {
    const { getByText, queryByText } = render(<ClientFormScreen />);
    fireEvent.press(getByText(/create/i));
    expect(queryByText(/name is required/i)).toBeTruthy();
  });
});
