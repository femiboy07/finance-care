/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        "shadow-move":{
          '0%':{
            width:"55px",
            height:"8px",
            opacity:"0.5"
          },
          '100%':{
            width:"30px",
            height:"6",
            opacity:"0.8",
          }
        },
        "logo-bounce":{
          "0%":{top:"-15px"},
          "100%":{top:"0px"}
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shadow-move":"shadow-move 0.7s ease-in-out infinite alternate ",
        "logo-bounce":"logo-bounce 0.7s linear infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate"),

    function({addUtilities}){
      addUtilities({

        '.scrollbar-widths':{
          '&::-webkit-scrollbar-width': {
            display: 'none',
          },
          'scrollbar-width':'8px',
          'border-radius':'25px',
        },
        /* Custom scrollbar styles */
        '.scrollbar-hide': {
          /* Hide scrollbar for WebKit browsers */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* Hide scrollbar for Firefox */
          '-ms-overflow-style': 'none',  /* IE and Edge */
          'scrollbar-width': 'none',  /* Firefox */
        },
        '.scrollbar-transparent': {
          /* Make scrollbar transparent */
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
          },
        },
        '.scrollbar-visible-on-hover': {
          '&:hover::-webkit-scrollbar': {
            width: '8px',
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
        },
      });
    }
  ],
}