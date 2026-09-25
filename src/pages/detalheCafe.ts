import { seloOrigem } from '../components/cardCafe';
import { alerta, esc, estrelas, imagemCafe, mensagemDeErro, mostrarErrosNosCampos, vazio } from '../components/ui';
import { avisar, navegar, type Contexto } from '../router';
import { estaLogado } from '../services/auth';
import { buscarCafe, buscarCafeExterno } from '../services/cafes';
import { criarComentario, listarComentarios } from '../services/comentarios';
import type { Cafe } from '../types';

/** #/cafes/:id — café cadastrado na API. */
export async function telaDetalheCafe({ params, app }: Contexto): Promise<void> {
  mostrarCafe(app, await buscarCafe(Number(params.id)));
  await mostrarComentarios(app, Number(params.id));
}

/** #/cafes/externo/:idExterno — café vindo da SampleAPIs (sem comentários). */
export async function telaDetalheCafeExterno({ params, app }: Contexto): Promise<void> {
  mostrarCafe(app, await buscarCafeExterno(Number(params.idExterno)));
  app.insertAdjacentHTML('beforeend', alerta('Comentários estão disponíveis apenas para cafés cadastrados localmente.', 'info'));
}

function mostrarCafe(app: HTMLElement, cafe: Cafe): void {
  const ingredientes = cafe.ingredientes ?? [];
  app.innerHTML = `
    <a href="#/" class="btn btn-link px-0 mb-3 text-cafe"><i class="bi bi-arrow-left"></i> Voltar ao catálogo</a>
    <div class="card shadow-sm overflow-hidden mb-4">
      <div class="row g-0">
        <div class="col-lg-5">${imagemCafe(cafe.imagem_url, cafe.nome, 'img-detalhe h-100')}</div>
        <div class="col-lg-7">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
              <h1 class="h2 mb-0 me-2">${esc(cafe.nome)}</h1>
              ${seloOrigem(cafe)}
            </div>
            <p class="lead">${esc(cafe.descricao || 'Sem descrição.')}</p>
            <h2 class="h6 text-uppercase text-body-secondary mt-4">Ingredientes</h2>
            ${
              ingredientes.length
                ? `<ul class="list-group list-group-flush">${ingredientes
                    .map((i) => `<li class="list-group-item px-0"><i class="bi bi-check2 text-cafe"></i> ${esc(i)}</li>`)
                    .join('')}</ul>`
                : '<p class="text-body-secondary">Não informados.</p>'
            }
            <div id="media" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>`;
}

async function mostrarComentarios(app: HTMLElement, cafeId: number): Promise<void> {
  const lista = await listarComentarios({ cafe_id: cafeId, ordenar_por: 'criado_em', direcao: 'desc', por_pagina: 50 });

  if (lista.itens.length) {
    const media = lista.itens.reduce((soma, c) => soma + c.nota, 0) / lista.itens.length;
    app.querySelector('#media')!.innerHTML =
      `${estrelas(media)} <span class="small text-body-secondary">${media.toFixed(1)} · ${lista.total} avaliação(ões)</span>`;
  }

  const formulario = estaLogado()
    ? `
      <form id="form-comentario" class="row g-2 mb-4" novalidate>
        <div class="col-sm-3">
          <label for="nota" class="form-label small mb-1">Nota</label>
          <select id="nota" name="nota" class="form-select">
            ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${'★'.repeat(n)} (${n})</option>`).join('')}
          </select>
        </div>
        <div class="col-sm-9">
          <label for="texto" class="form-label small mb-1">Comentário</label>
          <textarea id="texto" name="texto" class="form-control" rows="2" required placeholder="O que achou deste café?"></textarea>
          <div class="invalid-feedback">Escreva um comentário.</div>
        </div>
        <div class="col-12 text-end">
          <button type="submit" class="btn btn-cafe"><i class="bi bi-send"></i> Publicar</button>
        </div>
      </form>`
    : '<p class="small text-body-secondary"><a href="#/admin/login">Entre como admin</a> para comentar.</p>';

  app.insertAdjacentHTML(
    'beforeend',
    `
    <div class="card shadow-sm">
      <div class="card-header bg-body"><h2 class="h5 mb-0"><i class="bi bi-chat-left-text"></i> Comentários</h2></div>
      <div class="card-body">
        <div id="erro-comentario"></div>
        ${formulario}
        ${
          lista.itens.length
            ? `<ul class="list-group list-group-flush">${lista.itens
                .map(
                  (c) => `
                <li class="list-group-item px-0">
                  <div class="d-flex justify-content-between align-items-center">
                    ${estrelas(c.nota)}
                    <small class="text-body-secondary">Admin #${c.admin_id} · ${new Date(c.criado_em).toLocaleString('pt-BR')}</small>
                  </div>
                  <p class="mb-0 mt-1">${esc(c.texto)}</p>
                </li>`,
                )
                .join('')}</ul>`
            : vazio('Ainda não há comentários para este café.')
        }
      </div>
    </div>`,
  );

  const form = app.querySelector<HTMLFormElement>('#form-comentario');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.classList.add('was-validated');
    const dados = new FormData(form);
    try {
      await criarComentario({ cafe_id: cafeId, nota: Number(dados.get('nota')), texto: String(dados.get('texto')).trim() });
      avisar('Comentário publicado!');
      navegar(`/cafes/${cafeId}`); // redesenha a tela com o novo comentário
    } catch (erro) {
      if (!mostrarErrosNosCampos(form, erro)) app.querySelector('#erro-comentario')!.innerHTML = alerta(mensagemDeErro(erro));
    }
  });
}
