import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  //process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  //console.log(`NODE_ENV is ${process.env.NODE_ENV}, mode is ${mode}. VITE_TEST_VAR is ${process.env.VITE_TEST_VAR}`)

  return {
    base: './', // Use a relative path for built assets
    build: {
      sourcemap: mode === 'development', // Enable sourcemap only in development mode
      minify: mode === 'production', // Disable minification in development mode
      outDir: 'build',
    },
    plugins: [react()],
  };
});
