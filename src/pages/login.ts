import { alerta, mensagemDeErro } from '../components/ui';
import { avisar, navegar, type Contexto } from '../router';
import { estaLogado, login, logout } from '../services/auth';

export function telaLogin({ query, app }: Contexto): void {
  // Só aceita voltar para rotas internas do admin.
  const voltar = query.get('voltar')?.startsWith('/admin/') ? query.get('voltar')! : '/admin/cafes';
  if (estaLogado()) return navegar(voltar);

  app.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-7 col-lg-5 col-xl-4">
        <div class="card shadow-sm mt-md-4">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <i class="bi bi-shield-lock display-5 text-cafe"></i>
              <h1 class="h4 mt-2 mb-0">Área administrativa</h1>
              <p class="text-body-secondary small">Entre para gerenciar cafés e comentários.</p>
            </div>
            <div id="erro"></div>
            <form id="form-login" novalidate>
              <div class="mb-3">
                <label for="email" class="form-label">E-mail</label>
                <input type="email" id="email" name="email" class="form-control" autocomplete="username" required>
                <div class="invalid-feedback">Informe um e-mail válido.</div>
              </div>
              <div class="mb-4">
                <label for="senha" class="form-label">Senha</label>
                <input type="password" id="senha" name="senha" class="form-control" autocomplete="current-password" required>
                <div class="invalid-feedback">Informe a senha.</div>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-cafe"><i class="bi bi-box-arrow-in-right"></i> Entrar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`;

  const form = app.querySelector<HTMLFormElement>('#form-login')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.classList.add('was-validated');
    const dados = new FormData(form);
    const botao = form.querySelector('button')!;
    botao.disabled = true;
    try {
      await login(String(dados.get('email')).trim(), String(dados.get('senha')));
      avisar('Login realizado com sucesso!');
      navegar(voltar);
    } catch (erro) {
      app.querySelector('#erro')!.innerHTML = alerta(mensagemDeErro(erro));
      botao.disabled = false;
    }
  });
}

export function telaSair(): void {
  logout();
  avisar('Você saiu da área administrativa.', 'info');
  navegar('/');
}
