import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './', // Use a relative path for built assets
    build: {
      sourcemap: mode === 'development', // Enable sourcemap only in development mode
      outDir: 'build',
    },
    plugins: [react()],
  };
});
