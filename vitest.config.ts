import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      all: false,
      reporter: ['text', 'lcov', 'html'],
      thresholds: { statements: 70, branches: 60, functions: 60, lines: 70 },
      exclude: [
        'src/**/*.test.*',
        'src/mocks/**',
        '**/*.d.ts',
        'src/app/**',
        'src/components/**',
        'src/features/**/api.ts',
        'src/lib/providers.tsx',
        'src/lib/sentry.ts',
        'src/lib/logger.ts',
        'src/lib/env.ts',
        'src/lib/flags.ts',
        'src/lib/cn.ts',
        'src/lib/query-client.ts',
        'src/hooks/**',
        'src/stores/**',
        'src/types/**',
        'e2e/**'
      ]
    }
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
})
