exigirLogin();
document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('nome');
document.getElementById('btnSair').addEventListener('click', sair);

const corpo = document.getElementById('corpoTabela');
const formNovo = document.getElementById('formNovo');
const formEditar = document.getElementById('formEditar');
const selectAluno = document.getElementById('aluno');
const selectPlano = document.getElementById('plano');
const msg = document.getElementById('mensagem');

function mostrarMensagem(texto, erro = false) {
  msg.textContent = texto;
  msg.className = erro ? 'mensagem erro' : 'mensagem sucesso';
}

function formatarData(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function formatarDataHora(iso) {
  const [data, hora] = iso.split('T');
  return `${formatarData(data)} ${hora}`;
}

async function carregarAgendamentos() {
  const resp = await api('/api/agendamentos');
  const lista = await resp.json();

  corpo.innerHTML = '';
  if (lista.length === 0) {
    const tr = corpo.insertRow();
    const td = tr.insertCell();
    td.colSpan = 9;
    td.textContent = 'Nenhum agendamento cadastrado.';
    return;
  }

  lista.forEach(g => {
    const tr = corpo.insertRow();
    tr.insertCell().textContent = formatarDataHora(g.data_aula);
    tr.insertCell().textContent = g.status;
    tr.insertCell().textContent = g.nome_aluno;
    tr.insertCell().textContent = g.CPF;
    tr.insertCell().textContent = g.telefone;
    tr.insertCell().textContent = g.email;
    tr.insertCell().textContent = g.descricao;
    tr.insertCell().textContent =
      `${formatarData(g.data_inicio)} a ${formatarData(g.data_fim)}`;

    const btn = document.createElement('button');
    btn.textContent = 'Alterar data';
    btn.addEventListener('click', () => abrirEdicao(g));
    tr.insertCell().appendChild(btn);
  });
}

function abrirEdicao(g) {
  document.getElementById('idAgendamento').value = g.id_agendamento;
  document.getElementById('novaData').value = g.data_aula;
  formEditar.hidden = false;
  mostrarMensagem('');
  formEditar.scrollIntoView();
}

function fecharEdicao() {
  formEditar.reset();
  formEditar.hidden = true;
}

async function carregarAlunos() {
  const resp = await api('/api/planos/alunos');
  const alunos = await resp.json();
  alunos.forEach(a => {
    const op = document.createElement('option');
    op.value = a.id_aluno;
    op.textContent = a.nome;
    selectAluno.appendChild(op);
  });
}

selectAluno.addEventListener('change', async () => {
  selectPlano.innerHTML = '';
  const alunoId = selectAluno.value;

  if (!alunoId) {
    selectPlano.disabled = true;
    selectPlano.innerHTML = '<option value="">Selecione primeiro o aluno</option>';
    return;
  }

  const resp = await api('/api/agendamentos/planos/' + alunoId);
  const planos = await resp.json();

  if (planos.length === 0) {
    selectPlano.disabled = true;
    selectPlano.innerHTML = '<option value="">Este aluno não tem plano cadastrado</option>';
    return;
  }

  selectPlano.disabled = false;
  selectPlano.innerHTML = '<option value="">Selecione um plano</option>';
  planos.forEach(p => {
    const op = document.createElement('option');
    op.value = p.id_plano;
    op.textContent = p.descricao;
    selectPlano.appendChild(op);
  });
});

formNovo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const resp = await api('/api/agendamentos', {
    method: 'POST',
    body: JSON.stringify({
      aluno_id: selectAluno.value,
      plano_id: selectPlano.value,
      data_hora: document.getElementById('dataHora').value
    })
  });
  const dados = await resp.json();

  if (!resp.ok) { mostrarMensagem(dados.erro, true); return; }

  mostrarMensagem(dados.mensagem);
  formNovo.reset();
  selectPlano.disabled = true;
  selectPlano.innerHTML = '<option value="">Selecione primeiro o aluno</option>';
  carregarAgendamentos();
});

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('idAgendamento').value;

  const resp = await api('/api/agendamentos/' + id, {
    method: 'PUT',
    body: JSON.stringify({ data_hora: document.getElementById('novaData').value })
  });
  const dados = await resp.json();

  if (!resp.ok) { mostrarMensagem(dados.erro, true); return; }

  mostrarMensagem(dados.mensagem);
  fecharEdicao();
  carregarAgendamentos();
});

document.getElementById('btnCancelarEdicao').addEventListener('click', () => {
  fecharEdicao();
  mostrarMensagem('');
});

carregarAlunos();
carregarAgendamentos();