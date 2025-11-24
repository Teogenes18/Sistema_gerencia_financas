const path = require('path');
const { Sequelize } = require('sequelize');

const databasePath = path.resolve(__dirname, '../../../finance.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: false,
  pool: {
    max: 1,
    min: 1,
    acquire: 30000,
    idle: 10000
  }
});

async function initializeDatabase() {
  // Registrar modelos antes do sync
  require('../models');

  await sequelize.authenticate();

  // Melhor concorrência para SQLite
  try {
    await sequelize.query('PRAGMA journal_mode = WAL;');
    await sequelize.query('PRAGMA synchronous = NORMAL;');
    await sequelize.query('PRAGMA busy_timeout = 5000;'); // aguarda até 5s por lock
  } catch (e) {
    console.warn('Falha ao aplicar PRAGMAs:', e);
  }

  // Desabilita verificação de FK temporariamente para permitir alterações de esquema em dev
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF;');
  } catch (e) {
    console.warn('Não foi possível desabilitar foreign_keys:', e);
  }

  // Sincroniza esquema (em dev: alter true para atualizar sem perder dados)
  try {
    await sequelize.sync({ alter: true });
  } catch (syncErr) {
    console.error('Erro durante sequelize.sync:', syncErr);

    // Tentativa de recuperação específica para problemas com backup table criada pelo alter process
    try {
      const sqlFromError =
        (syncErr && (syncErr.sql || (syncErr.parent && syncErr.parent.sql))) || '';

      if (sqlFromError.includes('categories_backup') || (syncErr && syncErr.parent && syncErr.parent.code === 'SQLITE_CONSTRAINT')) {
        console.warn('Detectado conflito com categories_backup — tentando remover tabela categories_backup e sincronizar novamente (destrutivo para backup temporário).');

        try {
          // remover tabela de backup que pode ter sido criada parcialmente
          await sequelize.query('DROP TABLE IF EXISTS `categories_backup`;');
        } catch (dropErr) {
          console.warn('Falha ao dropar categories_backup:', dropErr);
        }

        // tentar sync novamente
        await sequelize.sync({ alter: true });
        console.info('Retry de sequelize.sync() bem sucedido após remover categories_backup.');
      } else {
        throw syncErr;
      }
    } catch (retryErr) {
      console.error('Retry para sequelize.sync falhou:', retryErr);
      // Recomenda-se remover o arquivo finance.sqlite em desenvolvimento se o retry falhar.
      throw retryErr;
    }
  } finally {
    // Reabilita foreign keys sempre
    try {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    } catch (e) {
      console.warn('Não foi possível reabilitar foreign_keys:', e);
    }
  }

  // Pre-popular categorias em dev/primeira execução (transaction + retries)
  try {
    const { Category } = require('../models');
    const count = await Category.count();
    if (count === 0) {
      const defaults = [
        { id: 1, name: 'Salário' },
        { id: 2, name: 'Conta' },
        { id: 3, name: 'Alimentação' },
        { id: 4, name: 'Saúde' },
        { id: 5, name: 'Transporte' },
        { id: 6, name: 'Lazer' }
      ];

      const maxRetries = 5;
      let attempt = 0;
      while (attempt < maxRetries) {
        const t = await sequelize.transaction();
        try {
          for (const d of defaults) {
            await Category.findOrCreate({
              where: { id: d.id },
              defaults: d,
              transaction: t
            });
          }
          await t.commit();
          break;
        } catch (err) {
          await t.rollback();
          attempt += 1;
          if (err && err.parent && err.parent.code === 'SQLITE_BUSY' && attempt < maxRetries) {
            // espera progressivamente antes de tentar novamente
            await new Promise(res => setTimeout(res, 200 * attempt));
            continue;
          }
          throw err;
        }
      }
    }
  } catch (e) {
    console.error('Erro ao popular categorias:', e);
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};