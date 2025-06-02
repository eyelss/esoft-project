import { createSlice } from "@reduxjs/toolkit";

export type ThemeType = 'dark' | 'light';

const getSystemTheme = (): ThemeType => 
  window.matchMedia('(prefers-color-scheme: dark)').matches ?
    'dark' :
    'light';

const DEFAULT_THEME: ThemeType = getSystemTheme();

export type ThemeState = {
  currentTheme: ThemeType;
};

const initialState: ThemeState = {
  currentTheme: localStorage.getItem('theme') as ThemeType ?? DEFAULT_THEME,
} 

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    }, 
  },
  selectors: {
    selectTheme: (state) => state.currentTheme,
  },
});

export const { toggleTheme } = themeSlice.actions;
export const { selectTheme } = themeSlice.selectors;
export default themeSlice.reducer;