const path = require('path');
const { Sequelize } = require('sequelize');

const databasePath = path.resolve(__dirname, '../../../finance.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: false
});

async function initializeDatabase() {
  // Ensure all models are registered before syncing the schema.
  require('../models');

  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = {
  sequelize,
  initializeDatabase
};
