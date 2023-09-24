import React from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const a = localStorage.getItem(key);
  const [value, setValue] = React.useState(a ? JSON.parse(a) : defaultValue);

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
};
