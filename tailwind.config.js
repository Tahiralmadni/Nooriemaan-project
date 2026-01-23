/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10b981',
                'primary-dark': '#059669',
            },
            fontFamily: {
                urdu: ['Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'serif'],
                english: ['Inter', 'Segoe UI', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
