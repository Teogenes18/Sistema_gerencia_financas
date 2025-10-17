const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addTransaction: (tx) => ipcRenderer.invoke('addTransaction', tx),
  listTransactions: () => ipcRenderer.invoke('listTransactions')
});
