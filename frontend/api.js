function tokenValido() {
  const token = sessionStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();   
  } catch {
    return false;
  }
}

function sair() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

function exigirLogin() {
  if (!tokenValido()) sair();
}

async function api(url, opcoes = {}) {
  const resp = await fetch(url, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
      ...(opcoes.headers || {})
    }
  });
  if (resp.status === 401) {   
    sair();
    throw new Error('Sessão expirada');
  }
  return resp;
}