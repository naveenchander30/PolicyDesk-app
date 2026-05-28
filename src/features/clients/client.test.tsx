import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import ClientFormScreen from "./client-form-screen";

const mockGoBack = jest.fn();

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

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: jest.fn(),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("ClientFormScreen", () => {
  beforeEach(() => {
    mockGoBack.mockClear();
  });

  it("shows validation error when name is empty", () => {
    render(<ClientFormScreen />);
    fireEvent.press(screen.getByText(/create/i));
    expect(screen.queryByText(/name is required/i)).toBeTruthy();
  });

  it("creates a client and navigates back", async () => {
    render(<ClientFormScreen />);
    const inputs = screen.getAllByTestId("text-input-outlined");
    fireEvent.changeText(inputs[0], "Jane Doe");
    fireEvent.changeText(inputs[1], "jane@example.com");
    fireEvent.changeText(inputs[2], "+1 555-0000");
    fireEvent.press(screen.getByText(/create/i));
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
  });
});
