exigirLogin();
document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('nome');
document.getElementById('btnSair').addEventListener('click', sair);

const corpo = document.getElementById('corpoTabela');
const form = document.getElementById('formPlano');
const msg = document.getElementById('mensagem');

function mostrarMensagem(texto, erro = false) {
  msg.textContent = texto;
  msg.className = erro ? 'mensagem erro' : 'mensagem sucesso';
}

function formatarData(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

async function carregarAlunos() {
  const resp = await api('/api/planos/alunos');
  const alunos = await resp.json();
  const select = document.getElementById('aluno');
  alunos.forEach(a => {
    const op = document.createElement('option');
    op.value = a.id_aluno;
    op.textContent = a.nome;
    select.appendChild(op);
  });
}

async function carregarPlanos() {
  const resp = await api('/api/planos');
  const planos = await resp.json();

  corpo.innerHTML = '';
  if (planos.length === 0) {
    const tr = corpo.insertRow();
    const td = tr.insertCell();
    td.colSpan = 4;
    td.textContent = 'Nenhum plano de treino cadastrado.';
    return;
  }

  planos.forEach(p => {
    const tr = corpo.insertRow();
    tr.insertCell().textContent = p.descricao;
    tr.insertCell().textContent = p.nome_aluno;
    tr.insertCell().textContent = formatarData(p.data_inicio);
    tr.insertCell().textContent = formatarData(p.data_fim);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const resp = await api('/api/planos', {
    method: 'POST',
    body: JSON.stringify({
      aluno_id: document.getElementById('aluno').value,
      descricao: document.getElementById('descricao').value,
      data_inicio: document.getElementById('dataInicio').value,
      data_fim: document.getElementById('dataFim').value
    })
  });
  const dados = await resp.json();

  if (!resp.ok) { mostrarMensagem(dados.erro, true); return; }

  mostrarMensagem(dados.mensagem);
  form.reset();
  carregarPlanos();
});

carregarAlunos();
carregarPlanos();