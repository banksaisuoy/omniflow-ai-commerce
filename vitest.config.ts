import { defineConfig, configDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: [...configDefaults.exclude, 'cypress/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
});
