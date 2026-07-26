/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0C10',
        'slate-surface': '#16181E',
        'slate-hover': '#21242E',
        brass: '#D4AF37',
        'brass-light': '#F3E197',
        pearl: '#F5F2EB',
        ebony: '#121316',
        steel: '#2B2E38',
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'brass-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'brass-glow-lg': '0 0 35px rgba(212, 175, 55, 0.5)',
      },
    },
  },
  plugins: [],
};
