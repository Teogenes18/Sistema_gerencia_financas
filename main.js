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
    icon: path.join(__dirname, 'assets', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  const devtoolsDisabled = process.env.DISABLE_DEVTOOLS === 'true';

  if (isDev) {
    mainWindow.loadURL('http://localhost:1234');
    if (!devtoolsDisabled) mainWindow.webContents.openDevTools({ mode: 'detach' });
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

  ipcMain.handle('listBanks', async () => {
    const { bankController: bc } = require('./src/server/controllers');
    return bc.listBanks();
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

  ipcMain.handle('listCategories', async () => {
    const { categoryController } = require('./src/server/controllers');
    return require('./src/server/controllers').categoryController.listCategories();
  });

  ipcMain.handle('setBankStatus', async (event, id) => {
    const { bankController } = require('./src/server/controllers');
    return bankController.setBankStatus(id);
  });

  ipcMain.handle('updateTransactionStatus', async (event, { id, userEmail, status }) => {
    try {
      const { transactionController } = require('./src/server/controllers');
      const result = await transactionController.updateTransactionStatus(id, userEmail, status);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false, message: 'Erro ao atualizar status.' };
    }
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
