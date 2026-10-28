exigirLogin();   // sem token válido, volta para o login

document.getElementById('nomeUsuario').textContent =
  sessionStorage.getItem('nome');

document.getElementById('btnSair').addEventListener('click', sair);