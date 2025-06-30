const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const config = {
    user: 'seu-usuario',
    password: 'sua-senha',
    server: 'seu-servidor.database.windows.net',
    database: 'seu-banco',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

app.post('/inscrever', async (req, res) => {
    try {
        const nome = req.body.nome;
        await sql.connect(config);
        await sql.query`INSERT INTO Inscricoes (nome) VALUES (${nome})`;
        res.send(`Bem-vindo à PUCPR, ${nome}!`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar no banco.');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});