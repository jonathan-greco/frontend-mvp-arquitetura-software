import { navbar } from './components/navbar';
import { alerta, esc, mensagemDeErro } from './components/ui';
import { estaLogado } from './services/auth';
import { ApiError } from './types';

/**
 * Roteador da SPA baseado no hash da URL (ex.: #/cafes/3).
 * Ao mudar o hash, o navegador NÃO recarrega a página: o roteador apenas
 * escolhe a tela correspondente e a desenha dentro de <main id="app">.
 */

export interface Contexto {
  params: Record<string, string>; // ex.: { id: "3" } em #/cafes/3
  query: URLSearchParams; // ex.: #/?nome=latte&pagina=2
  app: HTMLElement; // onde a tela se desenha
}

export interface Rota {
  caminho: string; // ex.: "/cafes/:id"
  titulo: string;
  tela: (ctx: Contexto) => void | Promise<void>;
  admin?: boolean; // exige login
}

let rotas: Rota[] = [];
let mensagemPendente: { texto: string; tipo: 'success' | 'info' | 'warning' } | null = null;

/** Mensagem exibida no topo da próxima tela (ex.: "Café salvo!"). */
export function avisar(texto: string, tipo: 'success' | 'info' | 'warning' = 'success'): void {
  mensagemPendente = { texto, tipo };
}

export function navegar(caminho: string): void {
  if (window.location.hash === `#${caminho}`) void renderizar();
  else window.location.hash = caminho;
}

/** Monta "caminho?chave=valor", ignorando valores vazios. */
export function comQuery(caminho: string, valores: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(valores)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor));
  }
  const qs = params.toString();
  return qs ? `${caminho}?${qs}` : caminho;
}

/** Procura a rota que casa com o caminho e extrai os parâmetros (:id). */
function encontrarRota(caminho: string): { rota: Rota; params: Record<string, string> } | null {
  for (const rota of rotas) {
    if (rota.caminho === '*') continue;
    const nomes: string[] = [];
    const regex = new RegExp('^' + rota.caminho.replace(/:(\w+)/g, (_, nome) => (nomes.push(nome), '([^/]+)')) + '$');
    const achou = regex.exec(caminho);
    if (achou) {
      const params: Record<string, string> = {};
      nomes.forEach((nome, i) => (params[nome] = decodeURIComponent(achou[i + 1])));
      return { rota, params };
    }
  }
  return null;
}

async function renderizar(): Promise<void> {
  const hash = window.location.hash.slice(1) || '/';
  const [caminho, qs = ''] = hash.split('?');
  const encontrada = encontrarRota(caminho) ?? { rota: rotas.find((r) => r.caminho === '*')!, params: {} };

  // Rotas do admin exigem login.
  if (encontrada.rota.admin && !estaLogado()) {
    avisar('Faça login para acessar a área administrativa.', 'info');
    navegar(comQuery('/admin/login', { voltar: hash }));
    return;
  }

  document.title = `${encontrada.rota.titulo} · Café Explorer`;
  document.getElementById('navbar')!.innerHTML = navbar(caminho);

  // Cada tela desenha em um elemento novo (evita que uma tela antiga sobrescreva a atual).
  const app = document.createElement('div');
  const aviso = mensagemPendente ? alerta(mensagemPendente.texto, mensagemPendente.tipo) : '';
  mensagemPendente = null;
  document.getElementById('app')!.replaceChildren(app);
  window.scrollTo(0, 0);

  try {
    await encontrada.rota.tela({ params: encontrada.params, query: new URLSearchParams(qs), app });
    if (aviso) app.insertAdjacentHTML('afterbegin', aviso);
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401 && encontrada.rota.admin) {
      avisar('Sua sessão expirou. Faça login novamente.', 'warning');
      navegar(comQuery('/admin/login', { voltar: hash }));
      return;
    }
    app.innerHTML = `${alerta(mensagemDeErro(erro))}<a href="#/" class="btn btn-cafe">${esc('Voltar ao catálogo')}</a>`;
  }
}

export function iniciarRouter(listaDeRotas: Rota[]): void {
  rotas = listaDeRotas;
  window.addEventListener('hashchange', () => void renderizar());
  void renderizar();
}
