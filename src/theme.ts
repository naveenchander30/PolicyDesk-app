import { MD3DarkTheme, configureFonts } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

const fontConfig = {
  fontFamily: "Inter",
};

export const policyDeskDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#adc6ff",
    onPrimary: "#002e6a",
    primaryContainer: "#4d8eff",
    onPrimaryContainer: "#00285d",
    secondary: "#c0c1ff",
    onSecondary: "#1000a9",
    secondaryContainer: "#3131c0",
    onSecondaryContainer: "#b0b2ff",
    tertiary: "#ffb786",
    onTertiary: "#502400",
    tertiaryContainer: "#df7412",
    onTertiaryContainer: "#461f00",
    error: "#ffb4ab",
    onError: "#690005",
    errorContainer: "#93000a",
    onErrorContainer: "#ffdad6",
    background: "#0b1326",
    onBackground: "#dae2fd",
    surface: "#171f33",
    onSurface: "#dae2fd",
    surfaceVariant: "#2d3449",
    onSurfaceVariant: "#c2c6d6",
    outline: "#8c909f",
    outlineVariant: "#424754",
    inverseSurface: "#dae2fd",
    inverseOnSurface: "#283044",
    inversePrimary: "#005ac2",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: "#0b1326",
      level1: "#171f33",
      level2: "#1a2238",
      level3: "#1d253c",
      level4: "#1f2840",
      level5: "#222a3d",
    },
  },
};
