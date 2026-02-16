/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Electric Indigo Brand
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    hover: '#4f46e5',   // Indigo 600
                    light: '#e0e7ff',   // Indigo 100
                },
                // Lime Punch Accent
                accent: {
                    DEFAULT: '#d9f99d', // Lime 200
                    text: '#365314',    // Lime 950
                },
                // Surface Colors
                surface: '#f9fafb',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter Tight', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.3s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
