import { cardCafe } from '../components/cardCafe';
import { alerta, carregando, esc, paginacao, vazio } from '../components/ui';
import { comQuery, navegar, type Contexto } from '../router';
import { listarCafes } from '../services/cafes';

const POR_PAGINA = 12;

const ORDENS: Record<string, string> = {
  'nome-asc': 'Nome (A-Z)',
  'nome-desc': 'Nome (Z-A)',
  'id-desc': 'Mais recentes',
  'id-asc': 'Mais antigos',
};

/** #/ — catálogo público com busca, ordenação e paginação (filtros ficam na URL). */
export async function telaCatalogo({ query, app }: Contexto): Promise<void> {
  const nome = query.get('nome') ?? '';
  const ordem = ORDENS[query.get('ordem') ?? ''] ? query.get('ordem')! : 'nome-asc';
  const externos = query.get('externos') !== 'nao';
  const pagina = Number(query.get('pagina')) || 1;

  app.innerHTML = `
    <div class="p-4 p-md-5 mb-4 rounded-3 text-white bg-cafe shadow-sm">
      <h1 class="display-6 fw-semibold"><i class="bi bi-cup-hot"></i> Variedades de café</h1>
      <p class="lead mb-0">Explore as variedades de cafés do espresso clássico até as versões geladas.</p>
    </div>

    <form id="filtros" class="row g-2 align-items-end mb-4">
      <div class="col-12 col-md-8">
        <label for="nome" class="form-label small text-body-secondary mb-1">Buscar por nome</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input type="search" id="nome" name="nome" class="form-control" placeholder="Ex.: latte, mocha..." value="${esc(nome)}">
        </div>
      </div>
      <div class="col-6 col-md-3">
        <label for="ordem" class="form-label small text-body-secondary mb-1">Ordenar por</label>
        <select id="ordem" name="ordem" class="form-select">
          ${Object.entries(ORDENS).map(([v, r]) => `<option value="${v}" ${v === ordem ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      <div class="col-12 col-md-1 d-grid">
        <button type="submit" class="btn btn-cafe"><i class="bi bi-funnel"></i> Filtrar</button>
      </div>
    </form>

    <div id="resultado">${carregando('Carregando cafés...')}</div>`;

  // Filtrar = navegar para a mesma rota com novos parâmetros na URL.
  const form = app.querySelector<HTMLFormElement>('#filtros')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    navegar(
      comQuery('/', {
        nome: String(dados.get('nome')).trim(),
        ordem: String(dados.get('ordem')),
        externos: dados.get('externos') ? undefined : 'nao',
      }),
    );
  });

  const [ordenarPor, direcao] = ordem.split('-') as ['id' | 'nome', 'asc' | 'desc'];
  const lista = await listarCafes({
    nome,
    incluir_externos: externos,
    ordenar_por: ordenarPor,
    direcao,
    pagina,
    por_pagina: POR_PAGINA,
  });

  const aviso =
    externos && lista.fonte_externa === 'indisponivel'
      ? alerta('A fonte externa está fora do ar. Exibindo apenas os cafés cadastrados localmente.', 'warning')
      : '';

  const resultado = app.querySelector('#resultado')!;
  if (lista.itens.length === 0) {
    resultado.innerHTML = aviso + vazio(nome ? `Nenhum café encontrado para "${nome}".` : 'Nenhum café cadastrado.');
    return;
  }

  resultado.innerHTML = `
    ${aviso}
    <p class="text-body-secondary small mb-3">${lista.total} café(s) encontrado(s)</p>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
      ${lista.itens.map(cardCafe).join('')}
    </div>
    ${paginacao(lista.total, pagina, POR_PAGINA, (p) =>
      '#' + comQuery('/', { nome, ordem, externos: externos ? undefined : 'nao', pagina: p }),
    )}`;
}
