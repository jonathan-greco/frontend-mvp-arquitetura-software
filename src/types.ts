/**
 * Tipos que espelham os dados da API de Cafés (ver Swagger em /apidocs).
 */

/** local = cadastrado na API; externa = vindo da SampleAPIs Coffee (somente leitura). */
export type OrigemCafe = 'local' | 'externa';

export interface Cafe {
  id: number | null; // null nos cafés externos
  id_externo: number | null; // null nos cafés locais
  origem: OrigemCafe;
  nome: string;
  descricao: string | null;
  ingredientes: string[] | null;
  imagem_url: string | null;
}

/** Dados enviados ao criar/editar um café. */
export interface CafeEntrada {
  nome: string;
  descricao?: string;
  ingredientes?: string[];
  imagem_url?: string;
}

export interface Comentario {
  id: number;
  admin_id: number;
  cafe_id: number;
  texto: string;
  nota: number; // 1 a 5
  criado_em: string;
}

/** Formato das listagens paginadas. */
export interface Lista<T> {
  itens: T[];
  total: number;
  pagina: number;
  por_pagina: number;
}

export interface ListaCafes extends Lista<Cafe> {
  fonte_externa: 'disponivel' | 'indisponivel' | 'desativada';
}

export interface Admin {
  id: number;
  nome: string;
  email: string;
}

export interface Token {
  access_token: string;
  expira_em_segundos: number;
}

/** Erro padronizado da aplicação (criado a partir de { erro: { codigo, mensagem, detalhes } }). */
export class ApiError extends Error {
  constructor(
    public status: number,
    mensagem: string,
    public detalhes?: Record<string, string[] | string>,
  ) {
    super(mensagem);
  }
}
