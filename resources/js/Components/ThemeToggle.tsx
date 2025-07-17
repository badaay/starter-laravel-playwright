import { useTheme } from '@/Contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme, isChangingTheme } = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle animation when theme changes
    useEffect(() => {
        if (isChangingTheme) {
            setIsAnimating(true);
            // Reset animation after it completes
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 800); // Animation duration increased

            return () => clearTimeout(timer);
        }
    }, [isChangingTheme]);

    const handleToggle = () => {
        setIsAnimating(true);
        toggleTheme();
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isChangingTheme}
            className="relative flex h-10 w-10 items-center justify-center rounded-full p-2 text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative h-6 w-6">
                {/* Sun icon (visible in dark mode) */}
                <div
                    className={`absolute inset-0 transform transition-all duration-500 ${
                        theme === 'dark'
                            ? 'rotate-0 scale-100 opacity-100'
                            : 'rotate-90 scale-0 opacity-0'
                    } ${isAnimating && theme === 'dark' ? 'animate-pulse-slow' : ''}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6 text-yellow-300"
                    >
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                </div>

                {/* Moon icon (visible in light mode) */}
                <div
                    className={`absolute inset-0 transform transition-all duration-500 ${
                        theme === 'light'
                            ? 'rotate-0 scale-100 opacity-100'
                            : '-rotate-90 scale-0 opacity-0'
                    } ${isAnimating && theme === 'light' ? 'animate-wiggle' : ''}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6 text-gray-600"
                    >
                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Loading spinner (visible during theme change) */}
                {isChangingTheme && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="theme-spinner"></div>
                    </div>
                )}
            </div>

            {/* Ripple effect when clicked */}
            {isAnimating && !isChangingTheme && (
                <span className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-75 dark:bg-indigo-900"></span>
            )}
        </button>
    );
}
