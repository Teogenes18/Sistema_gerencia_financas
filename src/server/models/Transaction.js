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
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
 },
  bankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'banks',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
