import React, { Dispatch, SetStateAction } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { useLocalStorage } from "../../hooks/localStorage";

export const ThemeContext = React.createContext<"light" | "dark">("light");
export const SetThemeContext = React.createContext<
  Dispatch<SetStateAction<"light" | "dark">>
>(() => undefined);

type Props = {
  children: React.ReactNode;
};

// export const useTheme = () => {
//   const [theme, setTheme] = React.useContext(ThemeContext);
//   const providerValue = React.useMemo(() => [theme, setTheme], [theme, setTheme]);
//
//   return providerValue;
// }

export const ThemeProvider: React.FC<Props> = ({ children }: Props) => {
  const [theme, setTheme] = useLocalStorage<string>("theme", "light");

  return (
    <HelmetProvider>
      <ThemeContext.Provider value={theme}>
        <SetThemeContext.Provider value={setTheme}>
          <Helmet>
            <html className={`theme-${theme}`} />
          </Helmet>

          {children}
        </SetThemeContext.Provider>
      </ThemeContext.Provider>
    </HelmetProvider>
  );
};
