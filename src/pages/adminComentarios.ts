import { alerta, esc, estrelas, mensagemDeErro, paginacao, vazio } from '../components/ui';
import { avisar, comQuery, navegar, type Contexto } from '../router';
import { listarCafesLocais } from '../services/cafes';
import { excluirComentario, listarComentarios } from '../services/comentarios';

const POR_PAGINA = 10;

export async function telaAdminComentarios({ query, app }: Contexto): Promise<void> {
  const cafeId = Number(query.get('cafe')) || undefined;
  const pagina = Number(query.get('pagina')) || 1;

  const [cafes, lista] = await Promise.all([
    listarCafesLocais(),
    listarComentarios({ cafe_id: cafeId, ordenar_por: 'criado_em', direcao: 'desc', pagina, por_pagina: POR_PAGINA }),
  ]);
  const nomeDoCafe = new Map(cafes.map((c) => [c.id, c.nome]));

  app.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h3 mb-0"><i class="bi bi-chat-left-text text-cafe"></i> Comentários</h1>
      <a href="#${comQuery('/admin/comentarios/novo', { cafe: cafeId })}" class="btn btn-cafe ${cafes.length ? '' : 'disabled'}">
        <i class="bi bi-plus-lg"></i> Novo comentário
      </a>
    </div>
    ${cafes.length ? '' : alerta('Cadastre um café local antes de criar comentários.', 'info')}
    <div class="mb-3" style="max-width: 360px">
      <select id="filtro-cafe" class="form-select" aria-label="Filtrar por café">
        <option value="">Todos os cafés</option>
        ${cafes.map((c) => `<option value="${c.id}" ${c.id === cafeId ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}
      </select>
    </div>
    <div id="erro"></div>
    <div class="card shadow-sm">
      ${
        lista.itens.length === 0
          ? vazio('Nenhum comentário encontrado.')
          : `
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Café</th>
                <th>Nota</th>
                <th>Comentário</th>
                <th class="d-none d-lg-table-cell">Autor / data</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${lista.itens
                .map(
                  (c) => `
                <tr>
                  <td><a href="#/cafes/${c.cafe_id}" class="text-cafe">${esc(nomeDoCafe.get(c.cafe_id) ?? `Café #${c.cafe_id}`)}</a></td>
                  <td>${estrelas(c.nota)}</td>
                  <td class="small">${esc(c.texto)}</td>
                  <td class="d-none d-lg-table-cell small text-body-secondary">
                    Admin #${c.admin_id}<br>${new Date(c.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td class="text-end text-nowrap">
                    <a href="#/admin/comentarios/${c.id}/editar" class="btn btn-sm btn-outline-primary" title="Editar"><i class="bi bi-pencil"></i></a>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-excluir="${c.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>`
      }
    </div>
    ${paginacao(lista.total, pagina, POR_PAGINA, (p) => '#' + comQuery('/admin/comentarios', { cafe: cafeId, pagina: p }))}`;

  app.querySelector<HTMLSelectElement>('#filtro-cafe')!.addEventListener('change', (e) => {
    navegar(comQuery('/admin/comentarios', { cafe: (e.target as HTMLSelectElement).value }));
  });

  app.querySelectorAll<HTMLButtonElement>('[data-excluir]').forEach((botao) =>
    botao.addEventListener('click', async () => {
      if (!confirm('Excluir este comentário?')) return;
      try {
        await excluirComentario(Number(botao.dataset.excluir));
        avisar('Comentário excluído.');
        navegar(comQuery('/admin/comentarios', { cafe: cafeId, pagina }));
      } catch (erro) {
        app.querySelector('#erro')!.innerHTML = alerta(mensagemDeErro(erro));
      }
    }),
  );
}
