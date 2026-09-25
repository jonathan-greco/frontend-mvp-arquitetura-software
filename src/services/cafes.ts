import type { Cafe, CafeEntrada, ListaCafes } from '../types';
import { requisicao } from './api';

export interface FiltroCafes {
  nome?: string;
  incluir_externos?: boolean;
  ordenar_por?: 'id' | 'nome';
  direcao?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

/** A fonte externa às vezes traz um item "modelo" (nome "string", sem id): ele é descartado. */
function ehValido(cafe: Cafe): boolean {
  return cafe.origem === 'local' || (cafe.id_externo !== null && cafe.nome !== 'string');
}

export async function listarCafes(filtro: FiltroCafes = {}): Promise<ListaCafes> {
  const lista = await requisicao<ListaCafes>('GET', '/cafes', { params: { ...filtro } });
  const itens = lista.itens.filter(ehValido);
  return { ...lista, itens, total: lista.total - (lista.itens.length - itens.length) };
}

/** Todos os cafés locais (para os selects do admin). */
export async function listarCafesLocais(): Promise<Cafe[]> {
  const lista = await listarCafes({ incluir_externos: false, ordenar_por: 'nome', por_pagina: 100 });
  return lista.itens;
}

export function buscarCafe(id: number): Promise<Cafe> {
  return requisicao<Cafe>('GET', `/cafes/${id}`, { params: { origem: 'local' } });
}

export function buscarCafeExterno(idExterno: number): Promise<Cafe> {
  return requisicao<Cafe>('GET', `/cafes/${idExterno}`, { params: { origem: 'externa' } });
}

export function criarCafe(dados: CafeEntrada): Promise<Cafe> {
  return requisicao<Cafe>('POST', '/cafes', { corpo: dados });
}

export function atualizarCafe(id: number, dados: CafeEntrada): Promise<Cafe> {
  return requisicao<Cafe>('PUT', `/cafes/${id}`, { corpo: dados });
}

export function excluirCafe(id: number): Promise<void> {
  return requisicao<void>('DELETE', `/cafes/${id}`);
}
