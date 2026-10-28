exigirLogin();
document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('nome');
document.getElementById('btnSair').addEventListener('click', sair);

const corpo = document.getElementById('corpoTabela');
const form = document.getElementById('formAluno');
const msg = document.getElementById('mensagem');

function mascararCpf(cpf) {
  return cpf.length === 11 ? '***.' + cpf.slice(3, 6) + '.***-' + cpf.slice(9) : '';
}

function mostrarMensagem(texto, erro = false) {
  msg.textContent = texto;
  msg.className = erro ? 'mensagem erro' : 'mensagem sucesso';
}

async function carregar(busca = '') {
  const resp = await api('/api/alunos?busca=' + encodeURIComponent(busca));
  const alunos = await resp.json();

  corpo.innerHTML = '';
  if (alunos.length === 0) {
    const tr = corpo.insertRow();
    const td = tr.insertCell();
    td.colSpan = 5;
    td.textContent = 'Nenhum aluno encontrado.';
    return;
  }

  alunos.forEach(a => {
    const tr = corpo.insertRow();
    // textContent evita injeção de HTML
    tr.insertCell().textContent = a.nome;
    tr.insertCell().textContent = mascararCpf(a.CPF);
    tr.insertCell().textContent = a.telefone;
    tr.insertCell().textContent = a.email;

    const btn = document.createElement('button');
    btn.textContent = 'Editar';
    btn.addEventListener('click', () => editar(a.id_aluno));
    tr.insertCell().appendChild(btn);
  });
}

async function editar(id) {
  const resp = await api('/api/alunos/' + id);
  const a = await resp.json();
  document.getElementById('idAluno').value = a.id_aluno;
  document.getElementById('nome').value = a.nome;
  document.getElementById('cpf').value = a.CPF;
  document.getElementById('telefone').value = a.telefone;
  document.getElementById('email').value = a.email;
  document.getElementById('tituloForm').textContent = 'Editar aluno';
  document.getElementById('btnCancelar').hidden = false;
  mostrarMensagem('');
  form.scrollIntoView();
}

function limparFormulario() {
  form.reset();
  document.getElementById('idAluno').value = '';
  document.getElementById('tituloForm').textContent = 'Novo aluno';
  document.getElementById('btnCancelar').hidden = true;
}

// BUSCA: atualiza a tabela após confirmar
document.getElementById('formBusca').addEventListener('submit', (e) => {
  e.preventDefault();
  carregar(document.getElementById('busca').value);
});

document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('busca').value = '';
  carregar();
});

document.getElementById('btnCancelar').addEventListener('click', () => {
  limparFormulario();
  mostrarMensagem('');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('idAluno').value;
  const corpoReq = {
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    telefone: document.getElementById('telefone').value,
    email: document.getElementById('email').value
  };

  const resp = await api(id ? '/api/alunos/' + id : '/api/alunos', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(corpoReq)
  });
  const dados = await resp.json();

  if (!resp.ok) { mostrarMensagem(dados.erro, true); return; }

  mostrarMensagem(dados.mensagem);
  limparFormulario();
  carregar(document.getElementById('busca').value);
});

carregar();