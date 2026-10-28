const express = require('express');
const db = require('../db');
const { descriptografar } = require('../utils/cripto');
const router = express.Router();

const mascararCpf = (cpf) =>
  cpf.length === 11 ? '***.' + cpf.slice(3, 6) + '.***-' + cpf.slice(9) : '';

function normalizarDataHora(valor) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor || '')) return null;
  const data = new Date(valor + ':00Z');
  if (isNaN(data) || data.toISOString().slice(0, 16) !== valor) return null;
  return valor.replace('T', ' ') + ':00';
}

async function horarioOcupado(dataHora, ignorarId = 0) {
  const [rows] = await db.execute(
    'SELECT id_agendamento FROM agendamento WHERE data_aula = ? AND id_agendamento <> ?',
    [dataHora, ignorarId]);
  return rows.length > 0;
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT g.id_agendamento,
             DATE_FORMAT(g.data_aula, '%Y-%m-%dT%H:%i') AS data_aula,
             g.status,
             a.id_aluno, a.nome AS nome_aluno, a.CPF, a.telefone, a.email,
             p.id_plano, p.descricao,
             DATE_FORMAT(p.data_inicio, '%Y-%m-%d') AS data_inicio,
             DATE_FORMAT(p.data_fim, '%Y-%m-%d') AS data_fim
      FROM agendamento g
      INNER JOIN aluno a ON a.id_aluno = g.aluno_id_aluno
      INNER JOIN plano_treino p ON p.id_plano = g.plano_treino_id_plano
      ORDER BY g.data_aula`);
    res.json(rows.map(r => ({ ...r, CPF: mascararCpf(descriptografar(r.CPF)) })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
});

router.get('/planos/:alunoId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id_plano, descricao FROM plano_treino WHERE aluno_id_aluno = ? ORDER BY data_inicio DESC',
      [req.params.alunoId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar planos do aluno.' });
  }
});

router.post('/', async (req, res) => {
  const alunoId = Number(req.body.aluno_id);
  const planoId = Number(req.body.plano_id);
  const dataHora = normalizarDataHora(req.body.data_hora);

  if (!alunoId) return res.status(400).json({ erro: 'Selecione o aluno.' });
  if (!planoId) return res.status(400).json({ erro: 'Selecione o plano de treino.' });
  if (!dataHora) return res.status(400).json({ erro: 'Informe uma data e hora válidas.' });

  try {
    const [plano] = await db.execute(
      'SELECT id_plano FROM plano_treino WHERE id_plano = ? AND aluno_id_aluno = ?',
      [planoId, alunoId]);
    if (!plano[0])
      return res.status(400).json({ erro: 'O plano selecionado não pertence a este aluno.' });

    if (await horarioOcupado(dataHora))
      return res.status(409).json({ erro: 'Já existe uma aula agendada neste horário.' });

    await db.execute(
      `INSERT INTO agendamento (data_aula, status, aluno_id_aluno, plano_treino_id_plano)
       VALUES (?, 'Agendado', ?, ?)`,
      [dataHora, alunoId, planoId]);
    res.status(201).json({ mensagem: 'Aula agendada com sucesso.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar agendamento.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const dataHora = normalizarDataHora(req.body.data_hora);
  if (!dataHora) return res.status(400).json({ erro: 'Informe uma data e hora válidas.' });

  try {
    if (await horarioOcupado(dataHora, id))
      return res.status(409).json({ erro: 'Já existe uma aula agendada neste horário.' });

    const [r] = await db.execute(
      'UPDATE agendamento SET data_aula = ? WHERE id_agendamento = ?',
      [dataHora, id]);
    if (r.affectedRows === 0)
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    res.json({ mensagem: 'Data do agendamento atualizada com sucesso.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
  }
});

module.exports = router;