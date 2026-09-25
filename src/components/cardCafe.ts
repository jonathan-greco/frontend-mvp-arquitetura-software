import type { Cafe } from '../types';
import { esc, imagemCafe } from './ui';

export function linkDoCafe(cafe: Cafe): string {
  return cafe.origem === 'local' ? `#/cafes/${cafe.id}` : `#/cafes/externo/${cafe.id_externo}`;
}

export function seloOrigem(cafe: Cafe): string {
  return cafe.origem === 'local'
    ? '<span class="badge text-bg-success"><i class="bi bi-house-door"></i> Local</span>'
    : '<span class="badge text-bg-secondary"><i class="bi bi-globe"></i> Externo</span>';
}

export function cardCafe(cafe: Cafe): string {
  const ingredientes = (cafe.ingredientes ?? []).slice(0, 4);
  return `
    <div class="col">
      <a href="${linkDoCafe(cafe)}" class="card card-cafe h-100 text-decoration-none text-reset shadow-sm">
        ${imagemCafe(cafe.imagem_url, cafe.nome, 'card-img-top')}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h2 class="h5 card-title mb-0">${esc(cafe.nome)}</h2>
            ${seloOrigem(cafe)}
          </div>
          <p class="card-text small text-body-secondary texto-limitado">${esc(cafe.descricao || 'Sem descrição.')}</p>
          <div class="mt-auto d-flex flex-wrap gap-1">
            ${ingredientes.map((i) => `<span class="badge rounded-pill bg-body-secondary text-body">${esc(i)}</span>`).join('')}
          </div>
        </div>
      </a>
    </div>`;
}
