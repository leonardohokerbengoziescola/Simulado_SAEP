const express = require('express');
const db = require('../db');
const { criptografar, descriptografar } = require('../utils/cripto');
const router = express.Router();

const formatar = (a) => ({ ...a, CPF: descriptografar(a.CPF) });

function validar(body) {
  const nome = (body.nome || '').trim();
  const cpf = (body.cpf || '').replace(/\D/g, '');
  const telefone = (body.telefone || '').replace(/\D/g, '');
  const email = (body.email || '').trim();

  if (!nome) return { erro: 'Informe o nome.' };
  if (cpf.length !== 11) return { erro: 'CPF deve ter 11 dígitos.' };
  if (telefone.length < 10 || telefone.length > 11)
    return { erro: 'Telefone deve ter 10 ou 11 dígitos.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { erro: 'E-mail inválido.' };
  return { dados: { nome, cpf, telefone, email } };
}

async function cpfJaExiste(cpf, ignorarId = 0) {
  const [rows] = await db.execute('SELECT id_aluno, CPF FROM aluno');
  return rows.some(r => r.id_aluno !== ignorarId &&
                        descriptografar(r.CPF) === cpf);
}

router.get('/', async (req, res) => {
  try {
    const busca = (req.query.busca || '').trim();
    let sql = 'SELECT id_aluno, nome, CPF, telefone, email FROM aluno';
    const params = [];
    if (busca) {
      sql += ' WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?';
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }
    sql += ' ORDER BY nome';
    const [rows] = await db.execute(sql, params);
    res.json(rows.map(formatar));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar alunos.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_aluno, nome, CPF, telefone, email FROM aluno WHERE id_aluno = ?',
      [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json(formatar(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar aluno.' });
  }
});

router.post('/', async (req, res) => {
  const { erro, dados } = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    if (await cpfJaExiste(dados.cpf))
      return res.status(409).json({ erro: 'Já existe um aluno com este CPF.' });

    await db.execute(
      'INSERT INTO aluno (nome, CPF, telefone, email) VALUES (?, ?, ?, ?)',
      [dados.nome, criptografar(dados.cpf), dados.telefone, dados.email]);
    res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno.' });
  }
});

router.put('/:id', async (req, res) => {
  const { erro, dados } = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const id = Number(req.params.id);
    if (await cpfJaExiste(dados.cpf, id))
      return res.status(409).json({ erro: 'Já existe outro aluno com este CPF.' });

    const [r] = await db.execute(
      'UPDATE aluno SET nome = ?, CPF = ?, telefone = ?, email = ? WHERE id_aluno = ?',
      [dados.nome, criptografar(dados.cpf), dados.telefone, dados.email, id]);
    if (r.affectedRows === 0)
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json({ mensagem: 'Aluno atualizado com sucesso.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar aluno.' });
  }
});

module.exports = router;