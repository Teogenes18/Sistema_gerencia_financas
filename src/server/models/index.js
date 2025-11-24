const Bank = require('./Bank');
const Transaction = require('./Transaction');
const User = require('./User');
const Category = require('./Category');

Transaction.belongsTo(User, {
  foreignKey: 'userEmail',
  targetKey: 'email',
  as: 'user'
});

User.hasMany(Transaction, {
  foreignKey: 'userEmail',
  sourceKey: 'email',
  as: 'transactions'
});

Transaction.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(Transaction, {
  foreignKey: 'categoryId',
  as: 'transactions'
});

Transaction.belongsTo(Bank, {
  foreignKey: 'bankId',
  as: 'bank'
});

Bank.hasMany(Transaction, {
  foreignKey: 'bankId',
  as: 'transactionsByBank'
});

module.exports = {
  Bank,
  Transaction,
  User,
  Category
};
