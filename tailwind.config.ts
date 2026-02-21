import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {
      colors: {
        'bg-page': 'var(--bg-page)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'bg-card-muted': 'var(--bg-card-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'status-success-bg': 'var(--status-success-bg)',
        'status-warning-bg': 'var(--status-warning-bg)',
        'status-danger-bg': 'var(--status-danger-bg)',
        'status-success-border': 'var(--status-success-border)',
        'status-warning-border': 'var(--status-warning-border)',
        'status-danger-border': 'var(--status-danger-border)',
        'status-success-text': 'var(--status-success-text)',
        'status-warning-text': 'var(--status-warning-text)',
        'status-danger-text': 'var(--status-danger-text)',
      },
      borderColor: {
        subtle: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        float: 'var(--shadow-float)',
      },
      ringColor: {
        focus: 'var(--ring-focus)',
      },
    },
  },
}

export default config
