const db = require('./db');
const { criptografar } = require('./utils/cripto');

const cpfs = { 1: '11144477735', 2: '52998224725', 3: '39053344705' };

(async () => {
  for (const [id, cpf] of Object.entries(cpfs)) {
    await db.execute('UPDATE aluno SET CPF = ? WHERE id_aluno = ?',
      [criptografar(cpf), id]);
  }
  console.log('CPFs atualizados.');
  process.exit();
})();