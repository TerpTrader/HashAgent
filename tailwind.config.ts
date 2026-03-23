import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: '#050505',
                    dark: '#030303',
                    light: '#f6f8f7',
                },
                surface: {
                    DEFAULT: '#111111',
                    card: '#151515',
                    elevated: '#1c1c1c',
                },
                primary: {
                    DEFAULT: '#14b8a6',
                    dark: '#0d9488',
                    light: '#2dd4bf',
                },
                accent: {
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#3b82f6',
                    purple: '#a78bfa',
                },
                muted: '#9ca3af',
                // Hash Agent domain status colors
                hash: {
                    washing: '#3b82f6',   // blue — active wash
                    drying: '#06b6d4',    // cyan — freeze drying
                    pressing: '#f59e0b',  // amber — rosin press
                    decarb: '#f97316',    // orange — decarb processing
                    complete: '#22c55e',  // green — batch complete
                    allocated: '#a78bfa', // purple — hash allocated
                    error: '#ef4444',     // red — machine error
                },
                // Micron grade colors (for charts)
                micron: {
                    160: '#f43f5e',   // rose
                    120: '#f97316',   // orange
                    90: '#eab308',    // yellow — premium grade
                    73: '#22c55e',    // green — full melt
                    45: '#3b82f6',    // blue
                    25: '#8b5cf6',    // violet
                },
                // Equipment status
                machine: {
                    online: '#22c55e',
                    offline: '#6b7280',
                    running: '#14b8a6',
                    error: '#ef4444',
                    idle: '#9ca3af',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                glow: '0 0 20px rgba(20,184,166,0.15)',
                'glow-lg': '0 0 40px rgba(20,184,166,0.20)',
                'glow-sm': '0 0 10px rgba(20,184,166,0.10)',
                'glow-warn': '0 0 12px rgba(245,158,11,0.15)',
                'glow-crit': '0 0 12px rgba(239,68,68,0.15)',
                panel: '0 4px 24px rgba(0,0,0,0.4)',
            },
            spacing: {
                sidebar: '240px',
                topbar: '56px',
                'mobile-tab': '64px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.25s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'shimmer': 'shimmer 2s infinite linear',
                'scale-in': 'scaleIn 0.2s ease-out',
                'slide-in-left': 'slideInLeft 0.25s ease-out',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.15)' },
                    '50%': { boxShadow: '0 0 30px rgba(20,184,166,0.25)' },
                },
            },
        },
    },
    plugins: [forms],
}

export default config
