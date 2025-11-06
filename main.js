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
    descricao TEXT,
    usuario_email TEXT NOT NULL,
    FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
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

try {
  const tableInfo = db.prepare("PRAGMA table_info(transacoes)").all();
  const hasUserEmail = tableInfo.some(col => col.name === 'usuario_email');
  
  if (!hasUserEmail) {
    const transacoes = db.prepare('SELECT * FROM transacoes').all();
    
    db.exec(`
      DROP TABLE transacoes;
      CREATE TABLE transacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        valor REAL NOT NULL,
        data TEXT NOT NULL,
        descricao TEXT,
        usuario_email TEXT NOT NULL,
        FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
      );
    `);
    
    const usuario = db.prepare('SELECT email FROM usuarios LIMIT 1').get();
    if (usuario && transacoes.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO transacoes (tipo, valor, data, descricao, usuario_email)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      transacoes.forEach(tx => {
        stmt.run(tx.tipo, tx.valor, tx.data, tx.descricao, usuario.email);
      });
    }
  }
} catch (error) {
  console.error('Erro na migração:', error);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
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
  db.prepare('INSERT INTO transacoes (tipo, valor, data, descricao,usuario_email) VALUES (?, ?, ?, ?,?)')
    .run(tx.tipo, tx.valor, tx.data, tx.descricao,tx.userEmail);
});

ipcMain.handle('listTransactions', (event,userEmail) => {
  return db.prepare('SELECT * FROM transacoes where usuario_email = ? ORDER BY data DESC, id DESC').all(userEmail);
});

ipcMain.handle('delete-transaction', (event, {id,userEmail}) => {
  db.prepare('DELETE FROM transacoes WHERE id = ? and usuario_email = ?').run(id,userEmail);
});

ipcMain.handle('addBank', (event, bank) => {
  const { nome, saldo } = bank;

  if(!nome || nome.trim() === '') {
    return { success: false, message: 'O nome do banco é obrigatório.' };
  }

  const valorSaldo = parseFloat(saldo);
  if(isNaN(valorSaldo)) {
    return { success: false, message: 'O saldo inicial deve ser um número válido.' };
  }

  db.prepare('INSERT INTO bancos (nome, saldo) VALUES (?, ?)')
    .run(nome.trim(), valorSaldo);
  return { success: true, message: 'Banco cadastrado com sucesso.' };
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

  if (!nome || !email || !senha)
    return { success: false, message: 'Preencha todos os campos.' };

  const existingUser = db.prepare('SELECT email FROM usuarios WHERE email = ?').get(email);
  if (existingUser)
    return { success: false, message: 'Este e-mail já está cadastrado.' };

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email))
    return { success: false, message: 'E-mail inválido.' };

  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha))
    return { success: false, message: 'A senha deve ter ao menos 8 caracteres, com letras e números.' };

  const hash = await bcrypt.hash(senha, 10);

  db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)').run(nome, email, hash);
  return { success: true, message: 'Usuário cadastrado com sucesso.' };
});

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

  return { 
    success: true, 
    message: 'Login bem-sucedido.', 
    userId: user.email, 
    nome: user.nome 
  };
});

ipcMain.handle('checkUserExists', () => {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
  return { userExists: existingUsers.count > 0 };
});


