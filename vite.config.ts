import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    process.env.API_KEY = env.API_KEY;
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
    process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;

    return {
      server: {
        port: 3005,
        host: true,
        strictPort: false,
        proxy: {
          '/api': {
            target: 'http://localhost:3006',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
