import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import generateLesson from './api/generate-lesson';

const readRequestBody = async (req: any) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    process.env.GEMINI_API_KEY ||= env.GEMINI_API_KEY;
    process.env.API_KEY ||= env.API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'local-api-generate-lesson',
          configureServer(server) {
            server.middlewares.use('/api/generate-lesson', async (req, res) => {
              const rawBody = await readRequestBody(req);
              const body = rawBody ? JSON.parse(rawBody) : {};

              await generateLesson(
                { ...req, body, method: req.method },
                {
                  setHeader: res.setHeader.bind(res),
                  status(statusCode: number) {
                    res.statusCode = statusCode;
                    return this;
                  },
                  json(payload: unknown) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(payload));
                  }
                }
              );
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
