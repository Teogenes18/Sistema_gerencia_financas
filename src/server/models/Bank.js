const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Bank = sequelize.define('Bank', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'banks',
  timestamps: true
});

module.exports = Bank;
