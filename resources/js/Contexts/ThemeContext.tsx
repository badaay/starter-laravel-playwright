import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isChangingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Check for saved theme preference or system preference
    const [theme, setTheme] = useState<Theme>(() => {
        // Check if the user has previously chosen a theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }

        // Check for system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        return 'light'; // Default theme
    });

    // Track theme change state for animations
    const [isChangingTheme, setIsChangingTheme] = useState(false);

    // Add transition classes to HTML and body on mount
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        // Apply transition classes
        html.classList.add('transition-theme');
        body.classList.add('transition-theme');

        // Apply initial theme
        if (theme === 'dark') {
            html.classList.add('dark');
        }

        return () => {
            // Clean up on unmount
            html.classList.remove('transition-theme');
            body.classList.remove('transition-theme');
        };
    }, []);

    useEffect(() => {
        // Save theme to localStorage
        localStorage.setItem('theme', theme);

        // Update the HTML class for dark mode
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setIsChangingTheme(true);

        // Short delay to allow the animation to start
        setTimeout(() => {
            setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));

            // Add a subtle flash effect
            const body = document.body;
            body.style.opacity = '0.98';

            // Reset changing state and opacity after transition completes
            setTimeout(() => {
                body.style.opacity = '1';
                setIsChangingTheme(false);
            }, 500);
        }, 50);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isChangingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
