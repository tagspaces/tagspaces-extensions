import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const prefix = `monaco-editor/esm/vs`;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './', // Use a relative path for built assets
    build: {
      sourcemap: mode === 'development', // Enable sourcemap only in development mode
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            jsonWorker: [`${prefix}/language/json/json.worker`],
            cssWorker: [`${prefix}/language/css/css.worker`],
            htmlWorker: [`${prefix}/language/html/html.worker`],
            tsWorker: [`${prefix}/language/typescript/ts.worker`],
            editorWorker: [`${prefix}/editor/editor.worker`],
          },
        },
      },
    },
    plugins: [react()],
  };
});
