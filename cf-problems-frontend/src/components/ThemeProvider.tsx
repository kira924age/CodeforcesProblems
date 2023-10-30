import React from "react";
import { Helmet } from "react-helmet";
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
  props: ThemeProviderProps,
) => {
  const [themeId, setThemeId] = useLocalStorage<string>("theme", "light");

  return (
    <ThemeContext.Provider value={[themeId, setThemeId]}>
      <Helmet>
        <html className={`theme-${themeId}`} />
      </Helmet>

      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const [themeId] = React.useContext(ThemeContext);

  return themeId;
};

export default ThemeProvider;
