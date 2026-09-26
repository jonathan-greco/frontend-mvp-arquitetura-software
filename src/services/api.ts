import { ApiError } from '../types';

/**
 * Endereço da API. O navegador chama a API diretamente, então ela precisa ter CORS liberado.
 * Pode ser trocado pela variável VITE_API_URL (arquivo .env ou --build-arg no Docker).
 */
const API_BASE: string = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/v1';
const CHAVE_SESSAO = 'cafe-explorer.sessao';

// ---------- Sessão (token JWT guardado no navegador) ----------

export function salvarToken(token: string, expiraEmSegundos: number): void {
  const sessao = { token, expiraEm: Date.now() + expiraEmSegundos * 1000 };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function removerToken(): void {
  localStorage.removeItem(CHAVE_SESSAO);
}

/** Devolve o token se ele ainda for válido. */
export function obterToken(): string | null {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) ?? 'null');
    if (sessao && Date.now() < sessao.expiraEm) return sessao.token;
  } catch {
    /* sessão inválida */
  }
  removerToken();
  return null;
}

// ---------- Requisições HTTP ----------

type Parametros = Record<string, string | number | boolean | undefined>;

/**
 * Ponto único de acesso à API: monta a URL, envia o token,
 * converte a resposta para JSON e transforma falhas em ApiError.
 */
export async function requisicao<T>(
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE',
  caminho: string,
  opcoes: { params?: Parametros; corpo?: unknown } = {},
): Promise<T> {
  const url = new URL(API_BASE + caminho);
  for (const [chave, valor] of Object.entries(opcoes.params ?? {})) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor));
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se ela está em execução.');
  }

  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401) removerToken(); // token expirado ou inválido
    const erro = dados?.erro;
    throw new ApiError(resposta.status, erro?.mensagem ?? `Erro ${resposta.status} na API.`, erro?.detalhes);
  }
  return dados as T;
}
