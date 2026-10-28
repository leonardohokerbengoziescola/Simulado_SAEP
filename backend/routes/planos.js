const express = require('express');
const db = require('../db');
const router = express.Router();

// Lista de alunos para o <select> (sem CPF)
router.get('/alunos', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_aluno, nome FROM aluno ORDER BY nome');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar alunos.' });
  }
});

// LISTAR  ->  GET /api/planos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.id_plano, p.descricao,
             DATE_FORMAT(p.data_inicio, '%Y-%m-%d') AS data_inicio,
             DATE_FORMAT(p.data_fim, '%Y-%m-%d') AS data_fim,
             p.aluno_id_aluno, a.nome AS nome_aluno
      FROM plano_treino p
      INNER JOIN aluno a ON a.id_aluno = p.aluno_id_aluno
      ORDER BY p.data_inicio DESC`);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar planos de treino.' });
  }
});

// CADASTRAR  ->  POST /api/planos
router.post('/', async (req, res) => {
  const descricao = (req.body.descricao || '').trim();
  const { data_inicio, data_fim } = req.body;
  const alunoId = Number(req.body.aluno_id);

  if (!descricao) return res.status(400).json({ erro: 'Informe a descrição.' });
  if (descricao.length > 45)
    return res.status(400).json({ erro: 'Descrição deve ter até 45 caracteres.' });
  if (!alunoId)
    return res.status(400).json({ erro: 'Associe o plano a um aluno.' });
  if (!data_inicio || !data_fim)
    return res.status(400).json({ erro: 'Informe as datas de início e fim.' });
  if (data_fim < data_inicio)   // formato AAAA-MM-DD compara como texto
    return res.status(400).json({ erro: 'A data fim não pode ser anterior à data início.' });

  try {
    const [aluno] = await db.execute(
      'SELECT id_aluno FROM aluno WHERE id_aluno = ?', [alunoId]);
    if (!aluno[0])
      return res.status(400).json({ erro: 'Aluno selecionado não existe.' });

    await db.execute(
      `INSERT INTO plano_treino (descricao, data_inicio, data_fim, aluno_id_aluno)
       VALUES (?, ?, ?, ?)`,
      [descricao, data_inicio, data_fim, alunoId]);
    res.status(201).json({ mensagem: 'Plano de treino cadastrado com sucesso.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar plano de treino.' });
  }
});

module.exports = router;