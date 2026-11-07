import React from "react";
import { ConfigProvider, theme } from "antd";
import { useLocalStorage } from "../utils/localStorage";

type ThemeId = "light" | "dark" | "purple";
type ThemeContextProps = [ThemeId, (newThemeId: ThemeId) => void];

export const ThemeContext = React.createContext<ThemeContextProps>([
  "light",
  (): void => {
    throw new Error("setThemeId is not implemented.");
  },
]);

interface ThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (
  props: ThemeProviderProps
) => {
  const [themeId, setThemeId] = useLocalStorage<string>("theme", "light");

  React.useLayoutEffect(() => {
    const { classList } = document.documentElement;
    const previousThemes = Array.from(classList).filter((name) =>
      name.startsWith("theme-")
    );
    classList.remove(...previousThemes);
    classList.add(`theme-${themeId}`);
    return () => {
      classList.remove(`theme-${themeId}`);
      classList.add(...previousThemes);
    };
  }, [themeId]);

  return (
    <ThemeContext.Provider value={[themeId, setThemeId]}>
      <ConfigProvider
        theme={{
          algorithm:
            themeId === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { borderRadius: 2, colorPrimary: "#1890ff" },
        }}
      >
        {props.children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const [themeId] = React.useContext(ThemeContext);

  return themeId;
};

export default ThemeProvider;
