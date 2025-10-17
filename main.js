const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let mainWindow;

// Criar/abrir banco SQLite
const db = new Database(path.join(__dirname, 'financas.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    descricao TEXT
  )
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

// IPC
ipcMain.handle('addTransaction', (event, tx) => {
  db.prepare('INSERT INTO transacoes (tipo, valor, data, descricao) VALUES (?, ?, ?, ?)')
    .run(tx.tipo, tx.valor, tx.data, tx.descricao);
});

ipcMain.handle('listTransactions', () => {
  return db.prepare('SELECT * FROM transacoes ORDER BY data DESC, id DESC').all();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
