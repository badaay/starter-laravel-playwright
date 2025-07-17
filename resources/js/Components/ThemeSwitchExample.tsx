import { useTheme } from '@/Contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeSwitchExample() {
    const { theme, isChangingTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 transition-colors duration-300 dark:text-white">
                Theme Switch Demo
            </h2>

            <div className="mb-4 flex items-center gap-3">
                <div
                    className={`h-4 w-4 rounded-full ${
                        theme === 'light' ? 'bg-blue-500' : 'bg-gray-400'
                    } ${isChangingTheme ? 'animate-pulse' : ''}`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Light Theme {theme === 'light' ? '(Active)' : ''}</span>
            </div>

            <div className="flex items-center gap-3">
                <div
                    className={`h-4 w-4 rounded-full ${
                        theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-400'
                    } ${isChangingTheme ? 'animate-pulse' : ''}`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Dark Theme {theme === 'dark' ? '(Active)' : ''}</span>
            </div>

            <div className="mt-6 space-y-4">
                <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        This element demonstrates the transition between themes.
                    </p>
                </div>

                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Different elements will transition smoothly between themes.
                    </p>
                </div>

                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        {isChangingTheme ? 'Theme is changing...' : `Current theme: ${theme}`}
                    </p>
                </div>
            </div>
        </div>
    );
}
