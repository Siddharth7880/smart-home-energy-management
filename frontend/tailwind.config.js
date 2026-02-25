/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // ✅ CRITICAL: enables dark: variant based on .dark class on <html>
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#10B981",
        danger: "#EF4444",
        "soft-green": "#E6F4F1",
        "soft-gray": "#F8FAFC",
      },

      fontSize: {
        // Larger base sizes for professional readability
        'xs': ['0.8rem', { lineHeight: '1.2rem' }],
        'sm': ['0.9rem', { lineHeight: '1.35rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.6rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },

      animation: {
        'float': 'float 6s ease-in-out infinite',
        'card-float': 'cardFloat 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'theme-icon': 'themeIconSpin 0.35s cubic-bezier(0.4,0,0.2,1)',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        // Subtle 6px float for dashboard cards
        cardFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px var(--accent-glow)' },
          '50%': { boxShadow: '0 0 28px var(--accent-glow), 0 0 42px rgba(34,197,94,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        themeIconSpin: {
          from: { transform: 'rotate(-90deg) scale(0.5)', opacity: '0' },
          to: { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
