const express = require('express');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send(`
    <form action="/inscrever" method="POST">
      <label>Digite seu nome:</label>
      <input type="text" name="nome" required />
      <button type="submit">Inscrever</button>
    </form>
  `);
});

app.post('/inscrever', async (req, res) => {
  const nome = req.body.nome;

  try {
    const credential = new DefaultAzureCredential();
    const accessToken = await credential.getToken('matricula-pucpr-servidor.database.windows.net');

    const pool = await sql.connect({
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      options: {
        encrypt: true
      },
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken.token
        }
      }
    });

    await pool.request()
      .input('nome', sql.NVarChar, nome)
      .query('INSERT INTO Inscricoes (Nome) VALUES (@nome)');

    res.send(`Bem-vindo à PUCPR, ${nome}! Sua inscrição foi registrada.`);
  } catch (err) {
    console.error('Erro ao salvar no banco:', err);
    res.status(500).send('Erro ao salvar no banco.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
