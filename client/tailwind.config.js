/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global "Trazy" design system — transport intelligence theme
        trazy: {
          bg:          '#0F0F0F',   // deep charcoal
          card:        '#1C1C1E',   // elevated surface
          accent:      '#A3E635',   // lime green — primary CTA
          accentHover: '#84CC16',
          secondary:   '#FACC15',   // amber — alerts / auto icon
          text:        '#F5F5F5',   // off-white
          muted:       '#A1A1AA',   // subdued labels
          blue:        '#2563EB',   // public transit leg
          purple:      '#7C3AED',   // private leg
          orange:      '#EA580C',   // driver / merge route
        }
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        pulsePin: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.35)', opacity: '0.7' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'pulse-pin': 'pulsePin 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
