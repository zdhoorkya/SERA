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
        paper: "#F7F6F2",
        ink: "#15130F",
        soft: "#57544B",
        faint: "#8A8779",
        line: "#D9D5C7",
        "line-strong": "#15130F",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-archivo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

