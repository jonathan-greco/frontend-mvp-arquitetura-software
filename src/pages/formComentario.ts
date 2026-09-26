import { alerta, esc, mensagemDeErro, mostrarErrosNosCampos } from '../components/ui';
import { avisar, navegar, type Contexto } from '../router';
import { listarCafesLocais } from '../services/cafes';
import { atualizarComentario, buscarComentario, criarComentario } from '../services/comentarios';

export async function telaFormComentario({ params, query, app }: Contexto): Promise<void> {
  const editando = params.id !== undefined;
  const [cafes, comentario] = await Promise.all([
    listarCafesLocais(),
    editando ? buscarComentario(Number(params.id)) : Promise.resolve(null),
  ]);
  const cafeSelecionado = comentario?.cafe_id ?? Number(query.get('cafe'));
  const nota = comentario?.nota ?? 5;

  app.innerHTML = `
    <a href="#/admin/comentarios" class="btn btn-link px-0 mb-3 text-cafe"><i class="bi bi-arrow-left"></i> Voltar para a lista</a>
    <div class="card shadow-sm">
      <div class="card-header bg-body">
        <h1 class="h4 mb-0">${editando ? 'Editar comentário' : 'Novo comentário'}</h1>
      </div>
      <div class="card-body p-4">
        <div id="erro"></div>
        <form id="form-comentario" novalidate>
          <div class="mb-3">
            <label for="cafe_id" class="form-label">Café <span class="text-danger">*</span></label>
            <select id="cafe_id" name="cafe_id" class="form-select" required ${editando ? 'disabled' : ''}>
              <option value="">Selecione...</option>
              ${cafes.map((c) => `<option value="${c.id}" ${c.id === cafeSelecionado ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}
            </select>
            <div class="invalid-feedback">Selecione um café.</div>
          </div>
          <div class="mb-3">
            <label for="nota" class="form-label">Nota <span class="text-danger">*</span></label>
            <select id="nota" name="nota" class="form-select">
              ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${n === nota ? 'selected' : ''}>(${n})</option>`).join('')}
            </select>
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-4">
            <label for="texto" class="form-label">Comentário <span class="text-danger">*</span></label>
            <textarea id="texto" name="texto" class="form-control" rows="4" required>${esc(comentario?.texto)}</textarea>
            <div class="invalid-feedback">Escreva o comentário.</div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <a href="#/admin/comentarios" class="btn btn-outline-secondary">Cancelar</a>
            <button type="submit" class="btn btn-cafe"><i class="bi bi-check-lg"></i> Salvar</button>
          </div>
        </form>
      </div>
    </div>`;

  const form = app.querySelector<HTMLFormElement>('#form-comentario')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.classList.add('was-validated');

    const dados = new FormData(form);
    const texto = String(dados.get('texto')).trim();
    const novaNota = Number(dados.get('nota'));
    const botao = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    botao.disabled = true;
    try {
      if (editando) await atualizarComentario(Number(params.id), { texto, nota: novaNota });
      else await criarComentario({ cafe_id: Number(dados.get('cafe_id')), texto, nota: novaNota });
      avisar(editando ? 'Comentário atualizado!' : 'Comentário criado!');
      navegar('/admin/comentarios');
    } catch (erro) {
      form.classList.remove('was-validated');
      if (!mostrarErrosNosCampos(form, erro)) app.querySelector('#erro')!.innerHTML = alerta(mensagemDeErro(erro));
      botao.disabled = false;
    }
  });
}
