const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  transactionType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  occurredOn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;
