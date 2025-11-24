// components/ThemeInitializer.jsx
'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ThemeInitializer() {
  const mode = useSelector((state) => state.settings.mode);

  useEffect(() => {
    // Apply theme on mount and when mode changes
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return null;
}