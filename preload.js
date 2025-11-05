const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerUser: (user) => ipcRenderer.invoke('registerUser', user),
  loginUser: (credentials) => ipcRenderer.invoke('loginUser', credentials),
  checkUserExists: () => ipcRenderer.invoke('checkUserExists'),
  addTransaction: (tx) => ipcRenderer.invoke('addTransaction', tx),
  listTransactions: (userEmail) => ipcRenderer.invoke('listTransactions',userEmail),
  deleteTransaction: (id,userEmail) => ipcRenderer.invoke('delete-transaction', {id,userEmail}),
  addBank: (bank) => ipcRenderer.invoke('addBank', bank)
});
