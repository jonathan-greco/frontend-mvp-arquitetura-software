import { defineConfig, loadEnv } from 'vite';

/**
 * O front chama sempre /api/... na própria origem, e o Vite repassa a chamada para a API.
 * Assim o navegador não faz requisição para outro domínio e o CORS não é necessário.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api': { target: env.API_URL || 'http://127.0.0.1:5000', changeOrigin: true },
  };

  return {
    server: { port: 5173, proxy },
    preview: { port: 8080, host: true, proxy },
  };
});
