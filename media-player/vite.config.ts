import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
