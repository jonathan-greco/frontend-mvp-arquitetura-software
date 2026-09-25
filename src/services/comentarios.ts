import type { Comentario, Lista } from '../types';
import { requisicao } from './api';

export interface FiltroComentarios {
  cafe_id?: number;
  ordenar_por?: 'id' | 'nota' | 'criado_em';
  direcao?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

export function listarComentarios(filtro: FiltroComentarios = {}): Promise<Lista<Comentario>> {
  return requisicao<Lista<Comentario>>('GET', '/comentarios', { params: { ...filtro } });
}

export function buscarComentario(id: number): Promise<Comentario> {
  return requisicao<Comentario>('GET', `/comentarios/${id}`);
}

export function criarComentario(dados: { cafe_id: number; texto: string; nota: number }): Promise<Comentario> {
  return requisicao<Comentario>('POST', '/comentarios', { corpo: dados });
}

export function atualizarComentario(id: number, dados: { texto: string; nota: number }): Promise<Comentario> {
  return requisicao<Comentario>('PUT', `/comentarios/${id}`, { corpo: dados });
}

export function excluirComentario(id: number): Promise<void> {
  return requisicao<void>('DELETE', `/comentarios/${id}`);
}
