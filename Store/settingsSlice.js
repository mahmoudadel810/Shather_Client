// store/settingsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'en',
  mode: 'light',
};

// Load from localStorage if available
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('language');
  const savedMode = localStorage.getItem('mode');
  if (savedLanguage) initialState.language = savedLanguage;
  if (savedMode) initialState.mode = savedMode;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload);
      }
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode', action.payload);
        // Apply dark class to html element
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleMode: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mode', newMode);
        if (newMode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
  },
});

export const { setLanguage, setMode, toggleMode } = settingsSlice.actions;
export default settingsSlice.reducer;