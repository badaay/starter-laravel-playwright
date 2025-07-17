import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            animation: {
                'spin-slow': 'spin 2s linear infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-in',
                'fade-out': 'fadeOut 0.5s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 3s infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(5deg)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                    },
                },
                dark: {
                    css: {
                        color: theme('colors.gray.300'),
                        h1: {
                            color: theme('colors.gray.100'),
                        },
                        h2: {
                            color: theme('colors.gray.100'),
                        },
                        h3: {
                            color: theme('colors.gray.100'),
                        },
                        h4: {
                            color: theme('colors.gray.100'),
                        },
                        p: {
                            color: theme('colors.gray.300'),
                        },
                        li: {
                            color: theme('colors.gray.300'),
                        },
                        strong: {
                            color: theme('colors.gray.100'),
                        },
                    },
                },
            }),
        },
    },

    plugins: [forms, typography],
};
