/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'growleo-blue': '#007AFF',
        'growleo-orange': '#FF9500',
        'growleo-orange-light': '#FFB74D',
        'growleo-orange-dark': '#F57C00',
      },
    },
  },
  plugins: [],
}

