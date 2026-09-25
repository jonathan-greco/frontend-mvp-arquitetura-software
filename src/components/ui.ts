import { ApiError } from '../types';

/** Escapa texto vindo da API antes de colocá-lo no HTML (evita XSS). */
export function esc(valor: unknown): string {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado.';
}

export function carregando(texto = 'Carregando...'): string {
  return `
    <div class="d-flex justify-content-center align-items-center gap-2 py-5 text-body-secondary">
      <div class="spinner-border text-cafe" role="status" aria-hidden="true"></div>
      <span>${esc(texto)}</span>
    </div>`;
}

export function alerta(mensagem: string, tipo: 'success' | 'danger' | 'warning' | 'info' = 'danger'): string {
  return `<div class="alert alert-${tipo}" role="alert">${esc(mensagem)}</div>`;
}

export function vazio(mensagem: string): string {
  return `
    <div class="text-center text-body-secondary py-5">
      <i class="bi bi-cup-hot display-5 d-block mb-2"></i>${esc(mensagem)}
    </div>`;
}

export function estrelas(nota: number): string {
  const cheias = Math.round(nota);
  let html = '';
  for (let i = 1; i <= 5; i++) html += `<i class="bi bi-star${i <= cheias ? '-fill' : ''}"></i>`;
  return `<span class="estrelas" title="Nota ${nota.toFixed(1)} de 5">${html}</span>`;
}

/** Imagem padrão quando o café não tem foto ou a URL falha. */
// Usa aspas duplas no SVG: encodeURIComponent as converte em %22, sem quebrar o atributo onerror.
const IMAGEM_PADRAO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#d7ccc8"/>' +
    '<text x="50%" y="55%" font-size="72" text-anchor="middle">☕</text></svg>',
);

export function imagemCafe(url: string | null, alt: string, classe: string): string {
  const src = url && /^https?:\/\//.test(url) ? url : IMAGEM_PADRAO;
  return `<img src="${esc(src)}" alt="${esc(alt)}" class="${classe}" loading="lazy"
    onerror="this.onerror=null;this.src='${IMAGEM_PADRAO}'">`;
}

/** Paginação simples com links "Anterior" e "Próxima". */
export function paginacao(total: number, pagina: number, porPagina: number, link: (p: number) => string): string {
  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) return '';
  const item = (p: number, texto: string, desabilitado: boolean) =>
    `<li class="page-item ${desabilitado ? 'disabled' : ''}"><a class="page-link" href="${link(p)}">${texto}</a></li>`;
  return `
    <nav aria-label="Paginação" class="mt-4">
      <ul class="pagination justify-content-center">
        ${item(pagina - 1, '<i class="bi bi-chevron-left"></i> Anterior', pagina <= 1)}
        <li class="page-item disabled"><span class="page-link">Página ${pagina} de ${totalPaginas}</span></li>
        ${item(pagina + 1, 'Próxima <i class="bi bi-chevron-right"></i>', pagina >= totalPaginas)}
      </ul>
    </nav>`;
}

/**
 * Mostra embaixo de cada campo os erros de validação devolvidos pela API (HTTP 422).
 * Retorna false se o erro não tinha detalhes por campo.
 */
export function mostrarErrosNosCampos(form: HTMLFormElement, erro: unknown): boolean {
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  if (!(erro instanceof ApiError) || !erro.detalhes) return false;
  let achou = false;
  for (const [campo, mensagens] of Object.entries(erro.detalhes)) {
    const input = form.elements.namedItem(campo) as HTMLElement | null;
    const feedback = input?.parentElement?.querySelector('.invalid-feedback');
    if (!input || !feedback) continue;
    input.classList.add('is-invalid');
    feedback.textContent = Array.isArray(mensagens) ? mensagens.join(' ') : mensagens;
    achou = true;
  }
  return achou;
}
