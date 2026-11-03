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
        gym: {
          base: "#0A0A0A",       // Main pitch dark background
          card: "#121212",       // Card dark grey
          elevated: "#18181B",   // Raised surface / modal / input
          border: "#27272A",     // Subdued borders
          hover: "#222225",      // Hover surface
        },
        neon: {
          DEFAULT: "#FF6B00",    // Sporty electric orange (One O One Gym)
          orange: "#FF6B00",     // Pure energetic orange
          bright: "#FF8533",     // Bright orange accent
          lime: "#FF8533",       // Bright orange alias
          muted: "#D95000",      // Deep sports orange
          dim: "rgba(255, 107, 0, 0.15)", // Subtle orange glow background
        },
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "sans-serif"],
        display: ["Montserrat", "Inter", "sans-serif"],
      },
      boxShadow: {
        "neon": "0 0 20px rgba(255, 107, 0, 0.45)",
        "neon-sm": "0 0 10px rgba(255, 107, 0, 0.35)",
        "neon-lg": "0 0 35px rgba(255, 107, 0, 0.6)",
      },
      keyframes: {
        pulseFast: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        scanline: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "pulse-fast": "pulseFast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
