const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const SEGREDO = 'troque_este_segredo';

router.post('/login', async (req, res) => {
  const { login, senha } = req.body;
  if (!login || !senha)
    return res.status(400).json({ erro: 'Informe login e senha.' });

  try {
    const [rows] = await db.execute(
      'SELECT id_usuario, nome, senha FROM usuario WHERE login = ?', [login]);
    const usuario = rows[0];
    const ok = usuario && await bcrypt.compare(senha, usuario.senha);

    if (!ok)
      return res.status(401).json({ erro: 'Login ou senha inválidos.' });

    const token = jwt.sign(
      { id: usuario.id_usuario, nome: usuario.nome },
      SEGREDO, { expiresIn: '30m' });   // expira em 30 minutos

    res.json({ token, nome: usuario.nome });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

module.exports = router;