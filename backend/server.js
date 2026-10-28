const express = require('express');
const path = require('path');
const verificarToken = require('./middleware/auth');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', require('./routes/auth'));
app.use('/api/alunos', verificarToken, require('./routes/alunos'));
app.use('/api/planos', verificarToken, require('./routes/planos'));
app.use('/api/agendamentos', verificarToken, require('./routes/agendamentos'));

app.listen(3030, () => console.log('Rodando em http://localhost:3030/login.html'));