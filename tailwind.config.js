/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        sync: {
          primary: "#2F6BFF", // Azul principal da navbar
          "primary-content": "#ffffff",
          secondary: "#4C8DFF", // Azul claro para destaques
          accent: "#00B8D9", // Acento ciano
          neutral: "#1F2937",
          "base-100": "#ffffff",
          "base-200": "#F3F4F6",
          info: "#38BDF8",
          success: "#22C55E", // Verde do botão Cadastrar
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      "light",
    ],
    darkTheme: "sync",
  },
};
