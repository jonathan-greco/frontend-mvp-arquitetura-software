import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

import { telaAdminCafes } from './pages/adminCafes';
import { telaAdminComentarios } from './pages/adminComentarios';
import { telaCatalogo } from './pages/catalogo';
import { telaDetalheCafe, telaDetalheCafeExterno } from './pages/detalheCafe';
import { telaFormCafe } from './pages/formCafe';
import { telaFormComentario } from './pages/formComentario';
import { telaLogin, telaSair } from './pages/login';
import { telaNaoEncontrada } from './pages/naoEncontrada';
import { iniciarRouter } from './router';

iniciarRouter([
  // Área pública
  { caminho: '/', titulo: 'Catálogo', tela: telaCatalogo },
  { caminho: '/cafes/externo/:idExterno', titulo: 'Café', tela: telaDetalheCafeExterno },
  { caminho: '/cafes/:id', titulo: 'Café', tela: telaDetalheCafe },

  // Área administrativa
  { caminho: '/admin/login', titulo: 'Login', tela: telaLogin },
  { caminho: '/admin/sair', titulo: 'Sair', tela: telaSair },
  { caminho: '/admin/cafes', titulo: 'Gerenciar cafés', tela: telaAdminCafes, admin: true },
  { caminho: '/admin/cafes/novo', titulo: 'Novo café', tela: telaFormCafe, admin: true },
  { caminho: '/admin/cafes/:id/editar', titulo: 'Editar café', tela: telaFormCafe, admin: true },
  { caminho: '/admin/comentarios', titulo: 'Comentários', tela: telaAdminComentarios, admin: true },
  { caminho: '/admin/comentarios/novo', titulo: 'Novo comentário', tela: telaFormComentario, admin: true },
  { caminho: '/admin/comentarios/:id/editar', titulo: 'Editar comentário', tela: telaFormComentario, admin: true },

  // Qualquer outro caminho
  { caminho: '*', titulo: 'Página não encontrada', tela: telaNaoEncontrada },
]);
