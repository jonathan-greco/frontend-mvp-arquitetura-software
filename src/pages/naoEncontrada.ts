import type { Contexto } from '../router';

export function telaNaoEncontrada({ app }: Contexto): void {
  app.innerHTML = `
    <div class="text-center py-5">
      <i class="bi bi-cup display-1 text-cafe"></i>
      <h1 class="h3 mt-3">Página não encontrada</h1>
      <p class="text-body-secondary">O endereço acessado não existe.</p>
      <a href="#/" class="btn btn-cafe">Ir para o catálogo</a>
    </div>`;
}
