import React, { createContext, useContext } from 'react';

    const ThemeContext = createContext(null);

    export const useTheme = () => {
      const context = useContext(ThemeContext);
      if (context === undefined) {
        // This component is not within a ThemeProvider, which is fine now.
        // Return a default or null object to avoid crashes.
        return { theme: 'default', changeTheme: () => {} };
      }
      return context;
    };
    
    // This provider is no longer necessary but is kept to prevent
    // potential crashes if it's imported elsewhere, although it does nothing.
    export const ThemeProvider = ({ children }) => {
      return (
        <ThemeContext.Provider value={null}>
          {children}
        </ThemeContext.Provider>
      );
    };