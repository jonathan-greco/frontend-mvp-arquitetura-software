import { alerta, esc, imagemCafe, mensagemDeErro, mostrarErrosNosCampos } from '../components/ui';
import { avisar, navegar, type Contexto } from '../router';
import { atualizarCafe, buscarCafe, criarCafe } from '../services/cafes';
import type { Cafe, CafeEntrada } from '../types';

export async function telaFormCafe({ params, app }: Contexto): Promise<void> {
  const editando = params.id !== undefined;
  const cafe: Cafe | null = editando ? await buscarCafe(Number(params.id)) : null;

  app.innerHTML = `
    <a href="#/admin/cafes" class="btn btn-link px-0 mb-3 text-cafe"><i class="bi bi-arrow-left"></i> Voltar para a lista</a>
    <div class="card shadow-sm">
      <div class="card-header bg-body">
        <h1 class="h4 mb-0">${editando ? `Editar "${esc(cafe!.nome)}"` : 'Novo café'}</h1>
      </div>
      <div class="card-body p-4">
        <div id="erro"></div>
        <form id="form-cafe" novalidate>
          <div class="mb-3">
            <label for="nome" class="form-label">Nome <span class="text-danger">*</span></label>
            <input type="text" id="nome" name="nome" class="form-control" required minlength="2" maxlength="120" value="${esc(cafe?.nome)}">
            <div class="invalid-feedback">O nome deve ter entre 2 e 120 caracteres.</div>
          </div>
          <div class="mb-3">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea id="descricao" name="descricao" class="form-control" rows="3">${esc(cafe?.descricao)}</textarea>
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label for="ingredientes" class="form-label">Ingredientes</label>
            <textarea id="ingredientes" name="ingredientes" class="form-control" rows="3"
              placeholder="Um por linha">${esc((cafe?.ingredientes ?? []).join('\n'))}</textarea>
            <div class="invalid-feedback"></div>
          </div>
          <div class="row g-3 align-items-end mb-4">
            <div class="col-md-8">
              <label for="imagem_url" class="form-label">URL da imagem</label>
              <input type="url" id="imagem_url" name="imagem_url" class="form-control" placeholder="https://..." value="${esc(cafe?.imagem_url)}">
              <div class="invalid-feedback">Informe uma URL válida (http ou https).</div>
            </div>
            <div class="col-md-4" id="preview">${imagemCafe(cafe?.imagem_url ?? null, 'Pré-visualização', 'img-preview img-thumbnail w-100')}</div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <a href="#/admin/cafes" class="btn btn-outline-secondary">Cancelar</a>
            <button type="submit" class="btn btn-cafe"><i class="bi bi-check-lg"></i> Salvar</button>
          </div>
        </form>
      </div>
    </div>`;

  const form = app.querySelector<HTMLFormElement>('#form-cafe')!;

  // Atualiza a pré-visualização quando a URL da imagem muda
  form.imagem_url.addEventListener('change', () => {
    app.querySelector('#preview')!.innerHTML = imagemCafe(form.imagem_url.value, 'Pré-visualização', 'img-preview img-thumbnail w-100');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.classList.add('was-validated');

    const dados = new FormData(form);
    const campo = (nome: string) => String(dados.get(nome) ?? '').trim();
    const ingredientes = campo('ingredientes').split('\n').map((i) => i.trim()).filter(Boolean);

    // Campos opcionais vazios não são enviados.
    const entrada: CafeEntrada = { nome: campo('nome') };
    if (campo('descricao')) entrada.descricao = campo('descricao');
    if (ingredientes.length) entrada.ingredientes = ingredientes;
    if (campo('imagem_url')) entrada.imagem_url = campo('imagem_url');

    const botao = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    botao.disabled = true;
    try {
      if (editando) await atualizarCafe(Number(params.id), entrada);
      else await criarCafe(entrada);
      avisar(editando ? 'Café atualizado!' : 'Café cadastrado!');
      navegar('/admin/cafes');
    } catch (erro) {
      form.classList.remove('was-validated');
      if (!mostrarErrosNosCampos(form, erro)) app.querySelector('#erro')!.innerHTML = alerta(mensagemDeErro(erro));
      botao.disabled = false;
    }
  });
}
