function tokenValido() {
  const token = sessionStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();   // confere se não expirou
  } catch {
    return false;
  }
}

function sair() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Chame no início de toda tela protegida
function exigirLogin() {
  if (!tokenValido()) sair();
}

// Use no lugar do fetch nas rotas protegidas
async function api(url, opcoes = {}) {
  const resp = await fetch(url, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
      ...(opcoes.headers || {})
    }
  });
  if (resp.status === 401) {   // token expirado ou inválido
    sair();
    throw new Error('Sessão expirada');
  }
  return resp;
}