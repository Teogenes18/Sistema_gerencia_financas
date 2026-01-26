const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerUser: (user) => ipcRenderer.invoke('registerUser', user),
  loginUser: (credentials) => ipcRenderer.invoke('loginUser', credentials),
  checkUserExists: () => ipcRenderer.invoke('checkUserExists'),
  addTransaction: (tx) => ipcRenderer.invoke('addTransaction', tx),
  listTransactions: (userEmail) => ipcRenderer.invoke('listTransactions',userEmail),
  listCategories: () => ipcRenderer.invoke('listCategories'),
  listBanks: () => ipcRenderer.invoke('listBanks'),
  deleteTransaction: (id,userEmail) => ipcRenderer.invoke('delete-transaction', {id,userEmail}),
  addBank: (bank) => ipcRenderer.invoke('addBank', bank),
  setBankStatus: (id) => ipcRenderer.invoke('setBankStatus', id),
  updateTransactionStatus: (id, userEmail, status) => ipcRenderer.invoke('updateTransactionStatus', { id, userEmail, status }),
  updateTransaction: (id, userEmail, updates) => ipcRenderer.invoke('updateTransaction', { id, userEmail, updates })
});
