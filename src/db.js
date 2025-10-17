const path = window.require('path');
const Database = window.require('better-sqlite3');
const DB_PATH = path.join(__dirname, '..', 'financas.db');

const dbModule = (() => {
  let dbInstance = null;
  function init() {
    if (dbInstance) return dbInstance;
    dbInstance = new Database(DB_PATH);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS transacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        valor REAL NOT NULL,
        data TEXT NOT NULL,
        descricao TEXT
      )
    `);
    return dbInstance;
  }
  function getAll() {
    const db = init();
    return db.prepare('SELECT * FROM transacoes ORDER BY data DESC, id DESC').all();
  }
  function addTransaction(tx) {
    const db = init();
    return db.prepare('INSERT INTO transacoes (tipo, valor, data, descricao) VALUES (?, ?, ?, ?)')
      .run(tx.tipo, tx.valor, tx.data, tx.descricao);
  }
  return Object.freeze({ init, getAll, addTransaction });
})();

module.exports = dbModule;
