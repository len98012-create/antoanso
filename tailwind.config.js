/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Đây là điểm quan trọng
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
