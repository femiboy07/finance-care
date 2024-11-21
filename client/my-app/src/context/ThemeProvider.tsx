import React, { createContext, SetStateAction, useContext, useEffect, useState } from 'react';



type Theme = 'light' | 'dark';

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}


interface themeProps {
    theme: string,
    setTheme: (theme: Theme) => void;


}

export const ThemeContext = createContext<themeProps | null>({ theme: 'white', setTheme: () => null });



export function ThemeProvider({ children, storageKey = 'femiootheme', defaultTheme = 'light' }: { children: React.ReactNode, storageKey?: string, defaultTheme?: Theme }) {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme)
    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{
            theme, setTheme: (theme: Theme) => {
                localStorage.setItem(storageKey, theme);
                setTheme(theme)
            }
        }}>
            {children}
        </ThemeContext.Provider>
    )
}


export function useTheme(): themeProps {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}