const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerUser: (user) => ipcRenderer.invoke('registerUser', user),
  loginUser: (credentials) => ipcRenderer.invoke('loginUser', credentials),
  addTransaction: (tx) => ipcRenderer.invoke('addTransaction', tx),
  listTransactions: () => ipcRenderer.invoke('listTransactions'),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id) 

});