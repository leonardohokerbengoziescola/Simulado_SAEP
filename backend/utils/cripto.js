const crypto = require('crypto');

// Em projeto real, esta chave ficaria em variável de ambiente
const CHAVE = crypto.scryptSync('troque_esta_chave_cpf', 'sal_academia', 32);

function criptografar(texto) {
  const iv = crypto.randomBytes(16);                  // IV novo a cada CPF
  const cifra = crypto.createCipheriv('aes-256-cbc', CHAVE, iv);
  const enc = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);
  return iv.toString('hex') + ':' + enc.toString('hex');
}

function descriptografar(valor) {
  try {
    const [ivHex, encHex] = valor.split(':');
    const decifra = crypto.createDecipheriv(
      'aes-256-cbc', CHAVE, Buffer.from(ivHex, 'hex'));
    return Buffer.concat([
      decifra.update(Buffer.from(encHex, 'hex')),
      decifra.final()
    ]).toString('utf8');
  } catch {
    return '';   // valor antigo/inválido no banco
  }
}

module.exports = { criptografar, descriptografar };