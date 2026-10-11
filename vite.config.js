import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const pathname = parsedUrl.pathname;
          const apiName = pathname.replace(/^\/api\//, '').split('/')[0];
          const filePath = path.resolve(process.cwd(), `api/${apiName}.js`);

          if (!fs.existsSync(filePath)) {
            return next();
          }

          const fileUrl = new URL(`file://${filePath}`).href;
          const mod = await import(`${fileUrl}?t=${Date.now()}`);
          const handler = mod.default;

          if (typeof handler !== 'function') return next();

          // Parse query
          const query = {};
          for (const [k, v] of parsedUrl.searchParams.entries()) {
            query[k] = v;
          }
          req.query = query;

          // Parse body
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString();
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              req.body = {};
            }
          }

          // Helper polyfills for express-like response
          if (!res.status) {
            res.status = function (code) {
              res.statusCode = code;
              return res;
            };
          }
          if (!res.json) {
            res.json = function (data) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
              return res;
            };
          }

          await handler(req, res);
        } catch (err) {
          console.error('API middleware error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/coc-api': {
        target: 'https://blood-alliance.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
