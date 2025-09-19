/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ASCII Art inspired color palette
        'ascii': {
          'classic': {
            'primary': '#0066cc',
            'secondary': '#004499',
            'accent': '#00aaff',
            'bg': '#f8f9fa',
            'text': '#212529',
            'border': '#dee2e6'
          },
          'neon': {
            'primary': '#ff00ff',
            'secondary': '#00ffff',
            'accent': '#ffff00',
            'bg': '#0a0a0a',
            'text': '#ffffff',
            'border': '#333333'
          },
          'custom': {
            'primary': '#6366f1',
            'secondary': '#8b5cf6',
            'accent': '#f59e0b',
            'bg': '#ffffff',
            'text': '#1f2937',
            'border': '#e5e7eb'
          }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'ascii': ['Courier New', 'monospace']
      },
      animation: {
        'typing': 'typing 3s steps(20, end)',
        'blink': 'blink 1s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out'
      },
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}