document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = document.getElementById('erro');
  erro.textContent = '';

  const resp = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login: document.getElementById('login').value,
      senha: document.getElementById('senha').value
    })
  });
  const dados = await resp.json();

  if (!resp.ok) { erro.textContent = dados.erro; return; }

  sessionStorage.setItem('token', dados.token);
  sessionStorage.setItem('nome', dados.nome);
  window.location.href = 'principal.html';  
});