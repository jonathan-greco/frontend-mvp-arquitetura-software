import { alerta, esc, imagemCafe, mensagemDeErro, paginacao, vazio } from '../components/ui';
import { avisar, comQuery, navegar, type Contexto } from '../router';
import { listarCafes, excluirCafe } from '../services/cafes';

const POR_PAGINA = 10;

/** #/admin/cafes — lista dos cafés locais com ações de editar e excluir. */
export async function telaAdminCafes({ query, app }: Contexto): Promise<void> {
  const nome = query.get('nome') ?? '';
  const pagina = Number(query.get('pagina')) || 1;

  const lista = await listarCafes({
    nome,
    incluir_externos: false,
    ordenar_por: 'id',
    direcao: 'desc',
    pagina,
    por_pagina: POR_PAGINA,
  });

  app.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h3 mb-0"><i class="bi bi-cup-hot text-cafe"></i> Gerenciar cafés</h1>
      <a href="#/admin/cafes/novo" class="btn btn-cafe"><i class="bi bi-plus-lg"></i> Novo café</a>
    </div>
    <p class="text-body-secondary small">
      Aqui aparecem apenas os cafés cadastrados na API. Os cafés externos (SampleAPIs) são somente leitura.
    </p>
    <form id="busca" class="input-group mb-3" style="max-width: 420px">
      <input type="search" name="nome" class="form-control" placeholder="Buscar por nome" value="${esc(nome)}">
      <button class="btn btn-outline-secondary" type="submit" aria-label="Buscar"><i class="bi bi-search"></i></button>
    </form>
    <div id="erro"></div>
    <div class="card shadow-sm">
      ${
        lista.itens.length === 0
          ? vazio(nome ? 'Nenhum café encontrado.' : 'Nenhum café cadastrado. Clique em "Novo café".')
          : `
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 70px">Foto</th>
                <th>Nome</th>
                <th class="d-none d-md-table-cell">Ingredientes</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${lista.itens
                .map(
                  (cafe) => `
                <tr>
                  <td>${imagemCafe(cafe.imagem_url, cafe.nome, 'img-miniatura rounded')}</td>
                  <td>
                    <div class="fw-semibold">${esc(cafe.nome)}</div>
                    <div class="small text-body-secondary text-truncate" style="max-width: 320px">${esc(cafe.descricao)}</div>
                  </td>
                  <td class="d-none d-md-table-cell small">${esc((cafe.ingredientes ?? []).join(', ') || '—')}</td>
                  <td class="text-end text-nowrap">
                    <a href="#/cafes/${cafe.id}" class="btn btn-sm btn-outline-secondary" title="Ver no site"><i class="bi bi-eye"></i></a>
                    <a href="#/admin/cafes/${cafe.id}/editar" class="btn btn-sm btn-outline-primary" title="Editar"><i class="bi bi-pencil"></i></a>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-excluir="${cafe.id}"
                      data-nome="${esc(cafe.nome)}" title="Excluir"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>`
      }
    </div>
    ${paginacao(lista.total, pagina, POR_PAGINA, (p) => '#' + comQuery('/admin/cafes', { nome, pagina: p }))}`;

  const form = app.querySelector<HTMLFormElement>('#busca')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    navegar(comQuery('/admin/cafes', { nome: String(new FormData(form).get('nome')).trim() }));
  });

  app.querySelectorAll<HTMLButtonElement>('[data-excluir]').forEach((botao) =>
    botao.addEventListener('click', async () => {
      if (!confirm(`Excluir o café "${botao.dataset.nome}"? Os comentários dele também serão removidos.`)) return;
      try {
        await excluirCafe(Number(botao.dataset.excluir));
        avisar('Café excluído.');
        navegar(comQuery('/admin/cafes', { nome, pagina }));
      } catch (erro) {
        app.querySelector('#erro')!.innerHTML = alerta(mensagemDeErro(erro));
      }
    }),
  );
}
