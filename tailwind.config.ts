import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#F1F7F3",
          100: "#DDEEE3",
          200: "#B8DCB3",
          300: "#86BF9B",
          400: "#509B75",
          500: "#317C57",
          600: "#246345",
          700: "#1D4E37",
          800: "#183F2E",
          900: "#122E22",
          950: "#0A1D15",
        },
        parchment: {
          50: "#FCFAF6",
          100: "#F7F3E9",
          200: "#EFE5D1",
          300: "#E4D4B5",
          400: "#D6C097",
          500: "#C4AC7B",
          600: "#A98E5E",
          700: "#876F48",
          800: "#695639",
          900: "#53442E",
        },
        bark: {
          100: "#EBE6E1",
          300: "#BDB0A3",
          500: "#755F4A",
          700: "#49392B",
          800: "#362A1F",
          900: "#221A13",
        },
        moss: {
          300: "#9FB885",
          400: "#7F9F61",
          500: "#638346",
          600: "#4D6935",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        handwriting: ["Caveat", "Patrick Hand", "Comic Sans MS", "cursive"],
      },
      boxShadow: {
        scrapbook: "0 10px 30px -5px rgba(34, 26, 19, 0.35), 0 0 0 1px rgba(105, 86, 57, 0.15)",
        polaroid: "0 6px 20px -2px rgba(24, 63, 46, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1)",
        tape: "0 1px 4px rgba(0,0,0,0.15)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gentlePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "gentle-pulse": "gentlePulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
