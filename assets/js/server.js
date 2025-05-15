const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido por CORS'));
    }
  }
}));

app.use(express.json());

let usuarios = [];

try {
  const dados = fs.readFileSync(path.join(__dirname, "usuarios.json"));
  usuarios = JSON.parse(dados);
} catch (erro) {
  console.error("Erro ao ler usuarios.json:", erro);
  usuarios = [];
}

app.post("/registrar", (req, res) => {
  const { email, senha } = req.body;

  if (usuarios.find(u => u.email === email)) {
    return res.json({ sucesso: false, mensagem: "Usuário já existe." });
  }

  usuarios.push({ email, senha });

  fs.writeFileSync(
    path.join(__dirname, "usuarios.json"),
    JSON.stringify(usuarios, null, 2)
  );

  res.json({ sucesso: true, mensagem: "Usuário registrado com sucesso!" });
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    res.json({ sucesso: true, mensagem: "Login realizado com sucesso!" });
  } else {
    res.json({ sucesso: false, mensagem: "Email ou senha inválidos." });
  }
});

let historico = [];

try {
  const dadosHistorico = fs.readFileSync(path.join(__dirname, "historico.json"));
  historico = JSON.parse(dadosHistorico);
} catch (erro) {
  console.error("Erro ao ler historico.json:", erro);
  historico = [];
}

app.post("/salvarHistorico", (req, res) => {
  const { email, moeda, quantidade, valorBRL, valorUSD } = req.body;

  const novaConversao = {
    email,
    moeda,
    quantidade,
    valorBRL,
    valorUSD,
    data: new Date().toISOString()
  };

  historico.push(novaConversao);

  fs.writeFileSync(
    path.join(__dirname, "historico.json"),
    JSON.stringify(historico, null, 2)
  );

  res.json({ sucesso: true, mensagem: "Histórico salvo com sucesso!" });
});

app.get('/historico', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ erro: "Email é obrigatório." });
  }

  const historicoFiltrado = historico.filter(h => h.email === email);
  res.json(historicoFiltrado);
});

let favoritos = {};

try {
  const dadosFavoritos = fs.readFileSync("favoritos.json", "utf8");
  favoritos = JSON.parse(dadosFavoritos);
} catch (erro) {
  favoritos = {};
}

app.post('/favoritar', (req, res) => {
  const { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos' });
  }

  try {
    let favoritos = [];

    if (fs.existsSync('favoritos.json')) {
      const data = fs.readFileSync('favoritos.json', 'utf-8');
      favoritos = data ? JSON.parse(data) : [];
    }

    let usuario = favoritos.find(item => item.email === email);

    if (!usuario) {
      usuario = { email, moedas: [] };
      favoritos.push(usuario);
    }

    if (!usuario.moedas.includes(id)) {
      usuario.moedas.push(id);
    }

    fs.writeFileSync('favoritos.json', JSON.stringify(favoritos, null, 2));

    res.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro ao salvar favoritas:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar favoritas' });
  }
});

app.get('/favoritos', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ mensagem: "Email não informado" });
  }

  try {
    const favoritas = fs.existsSync('favoritos.json')
      ? JSON.parse(fs.readFileSync('favoritos.json', 'utf-8'))
      : [];

    const usuario = favoritas.find(item => item.email === email);
    res.json(usuario ? usuario.moedas : []);
  } catch (erro) {
    console.error('Erro ao ler favoritas:', erro);
    res.status(500).json([]);
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
