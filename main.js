const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

let mainWindow;

const db = new Database(path.join(__dirname, 'financas.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    descricao TEXT
  );
  
  CREATE TABLE IF NOT EXISTS usuarios (
    email TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    senha TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS bancos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    saldo REAL NOT NULL
  );
`);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:1234');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

ipcMain.handle('addTransaction', (event, tx) => {
  db.prepare('INSERT INTO transacoes (tipo, valor, data, descricao) VALUES (?, ?, ?, ?)')
    .run(tx.tipo, tx.valor, tx.data, tx.descricao);
});

ipcMain.handle('listTransactions', () => {
  return db.prepare('SELECT * FROM transacoes ORDER BY data DESC, id DESC').all();
});

ipcMain.handle('delete-transaction', (event, id) => {
  db.prepare('DELETE FROM transacoes WHERE id = ?').run(id);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('registerUser', async (event, user) => {
  const { nome, email, senha } = user;

  // Validações básicas
  if (!nome || !email || !senha)
    return { success: false, message: 'Preencha todos os campos.' };

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email))
    return { success: false, message: 'E-mail inválido.' };

  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha))
    return { success: false, message: 'A senha deve ter ao menos 8 caracteres, com letras e números.' };

  const existingUser = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (existingUser)
    return { success: false, message: 'E-mail já cadastrado.' };

  // Cria hash seguro da senha
  const hash = await bcrypt.hash(senha, 10);

  db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)').run(nome, email, hash);
  return { success: true, message: 'Usuário cadastrado com sucesso.' };
});

// ====================== LOGIN ======================
ipcMain.handle('loginUser', async (event, credentials) => {
  const { email, senha } = credentials;

  if (!email || !senha)
    return { success: false, message: 'Preencha e-mail e senha.' };

  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user)
    return { success: false, message: 'E-mail ou senha inválidos.' };

  const senhaOk = await bcrypt.compare(senha, user.senha);
  if (!senhaOk)
    return { success: false, message: 'E-mail ou senha inválidos.' };

  return { success: true, message: 'Login bem-sucedido.', userId: user.id, nome: user.nome };
});


