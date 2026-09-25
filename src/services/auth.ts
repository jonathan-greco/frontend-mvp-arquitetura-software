import type { Admin, Token } from '../types';
import { obterToken, removerToken, requisicao, salvarToken } from './api';

export async function login(email: string, senha: string): Promise<void> {
  const token = await requisicao<Token>('POST', '/admin/auth/login', { corpo: { email, senha } });
  salvarToken(token.access_token, token.expira_em_segundos);
}

export function logout(): void {
  removerToken();
}

export function estaLogado(): boolean {
  return obterToken() !== null;
}

export function meuStatus(): Promise<Admin> {
  return requisicao<Admin>('GET', '/admin/meu-status');
}
