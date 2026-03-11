import React, { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const toggle = () => setDark(d => {
    localStorage.setItem('theme', !d ? 'dark' : 'light');
    return !d;
  });
  useEffect(() => {
    document.body.style.background = dark ? '#0a0d14' : '#f0f2f8';
    document.body.style.color = dark ? '#e8eaf0' : '#1a1a2e';
  }, [dark]);
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
