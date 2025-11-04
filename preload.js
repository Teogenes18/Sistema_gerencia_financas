const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerUser: (user) => ipcRenderer.invoke('registerUser', user),
  loginUser: (credentials) => ipcRenderer.invoke('loginUser', credentials),
  checkUserExists: () => ipcRenderer.invoke('checkUserExists'),
  addTransaction: (tx) => ipcRenderer.invoke('addTransaction', tx),
  listTransactions: () => ipcRenderer.invoke('listTransactions'),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  addBank: (bank) => ipcRenderer.invoke('addBank', bank)
});
