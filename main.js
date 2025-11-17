const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeDatabase } = require('./src/server/database');
const {
  bankController,
  transactionController,
  userController
} = require('./src/server/controllers');

let mainWindow;
const dbReady = initializeDatabase();

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
function registerIpcHandlers() {
  ipcMain.handle('addTransaction', async (event, tx) => {
    return transactionController.addTransaction(tx);
  });

  ipcMain.handle('listTransactions', async (event, userEmail) => {
    return transactionController.listTransactions(userEmail);
  });

  ipcMain.handle('delete-transaction', async (event, payload) => {
    return transactionController.deleteTransaction(payload);
  });

  ipcMain.handle('addBank', async (event, bank) => {
    return bankController.addBank(bank);
  });

  ipcMain.handle('registerUser', async (event, user) => {
    return userController.registerUser(user);
  });

  ipcMain.handle('loginUser', async (event, credentials) => {
    return userController.loginUser(credentials);
  });

  ipcMain.handle('checkUserExists', async () => {
    return userController.checkUserExists();
  });
}

dbReady
  .then(() => app.whenReady())
  .then(() => {
    registerIpcHandlers();
    createWindow();
  })
  .catch(error => {
    console.error('Erro ao inicializar a aplicação:', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  dbReady
    .then(() => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
    .catch(error => {
      console.error('Erro ao reativar a aplicação:', error);
    });
});
