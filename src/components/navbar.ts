import { estaLogado } from '../services/auth';

function link(href: string, rotulo: string, ativo: boolean): string {
  return `<li class="nav-item"><a class="nav-link ${ativo ? 'active' : ''}" href="${href}">${rotulo}</a></li>`;
}

/** Barra de navegação */
export function navbar(caminhoAtual: string): string {
  const em = (prefixo: string) => caminhoAtual.startsWith(prefixo);
  const noCatalogo = caminhoAtual === '/' || em('/cafes');

  const menuAdmin = estaLogado()
    ? `
      ${link('#/admin/cafes', '<i class="bi bi-cup-hot"></i> Gerenciar cafés', em('/admin/cafes'))}
      ${link('#/admin/comentarios', '<i class="bi bi-chat-left-text"></i> Comentários', em('/admin/comentarios'))}
      <li class="nav-item ms-lg-3">
        <a class="btn btn-sm btn-outline-light mt-1" href="#/admin/sair"><i class="bi bi-box-arrow-right"></i> Sair</a>
      </li>`
    : link('#/admin/login', '<i class="bi bi-lock"></i> Área admin', em('/admin'));

  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-cafe shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-semibold" href="#/"><i class="bi bi-cup-hot-fill"></i> Café Explorer</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
          aria-controls="menu" aria-expanded="false" aria-label="Abrir menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav me-auto">${link('#/', '<i class="bi bi-grid"></i> Catálogo', noCatalogo)}</ul>
          <ul class="navbar-nav">${menuAdmin}</ul>
        </div>
      </div>
    </nav>`;
}
