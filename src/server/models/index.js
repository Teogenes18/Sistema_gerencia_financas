const Bank = require('./Bank');
const Transaction = require('./Transaction');
const User = require('./User');

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

module.exports = {
  Bank,
  Transaction,
  User
};
