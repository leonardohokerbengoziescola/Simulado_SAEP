exigirLogin();   

document.getElementById('nomeUsuario').textContent =
  sessionStorage.getItem('nome');

document.getElementById('btnSair').addEventListener('click', sair);