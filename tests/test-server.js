const express = require("express");
const { EscOAuthClient } = require("../src/client");

const app = express();

let TOKENS = {
  accessToken: null,
  refreshToken: null
};

const esc = new EscOAuthClient({
  clientId: "",
  clientSecret: "",
  redirectUri: ""
});

app.get("/login", (req, res) => {
  const authUrl = esc.getAuthorizationUrl(["identify"]);

  res.send(`
    <h2>ESC OAuth Test</h2>
    <a href="${authUrl}">Entrar com uma conta ESC</a>
  `);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send(`
      <p>Code não recebido</p>
      <a href="/login">Tentar novamente</a>
    `);
  }

  try {
    const token = await esc.exchangeCode(code);

    TOKENS.accessToken = token.access_token;
    TOKENS.refreshToken = token.refresh_token;

    console.log("✅ Access Token:", TOKENS.accessToken);
    console.log("✅ Refresh Token:", TOKENS.refreshToken);

    // 2️⃣ busca usuário
    const me = await esc.getMe(TOKENS.accessToken);

    console.log("✅ Usuário:", me);

    res.send(`
      <h2>Login realizado</h2>
      <p><strong>ID:</strong> ${me.id}</p>
      <p><strong>Username:</strong> ${me.username}</p>

      <hr />
      <a href="/me">Ver /@me</a><br />
      <a href="/refresh">Reset / Refresh Token</a>
    `);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message
    });
  }
});

app.get("/me", async (req, res) => {
  if (!TOKENS.accessToken) {
    return res.redirect("/login");
  }

  try {
    const me = await esc.getMe(TOKENS.accessToken);
    res.json(me);
  } catch (err) {
    res.status(401).json({
      error: true,
      message: err.message
    });
  }
});

app.get("/refresh", async (req, res) => {
  if (!TOKENS.refreshToken) {
    return res.redirect("/login");
  }

  try {
    const newToken = await esc.refreshToken(TOKENS.refreshToken);

    TOKENS.accessToken = newToken.access_token;
    if (newToken.refresh_token) {
      TOKENS.refreshToken = newToken.refresh_token;
    }

    console.log("🔄 Token renovado:", TOKENS.accessToken);

    res.send(`
      <h2>Token resetado com sucesso</h2>
      <p>Novo Access Token:</p>
      <code>${TOKENS.accessToken}</code>
      <br /><br />
      <a href="/me">Testar /@me novamente</a>
    `);
  } catch (err) {
    res.status(401).json({
      error: true,
      message: err.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Test server rodando em http://localhost:${PORT}`);
  console.log(`👉 http://localhost:${PORT}/login`);
});
