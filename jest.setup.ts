jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    MaterialCommunityIcons: (props: { name?: string; size?: number; color?: string }) =>
      React.createElement(Text, null, props.name || "icon"),
    Ionicons: (props: { name?: string; size?: number; color?: string }) =>
      React.createElement(Text, null, props.name || "icon"),
  };
});

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: (props: { children: React.ReactNode }) =>
      React.createElement(View, null, props.children),
    Swipeable: (props: { children: React.ReactNode }) =>
      React.createElement(View, null, props.children),
  };
});

jest.mock("@react-native-community/datetimepicker", () => {
  return () => null;
});
