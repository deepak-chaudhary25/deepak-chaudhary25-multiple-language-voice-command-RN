import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // In React Native CLI, fonts are loaded automatically after linking
    // We just need to set the state to true
    setFontsLoaded(true);
  }, []);

  return { fontsLoaded };
}; 