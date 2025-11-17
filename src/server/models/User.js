const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
