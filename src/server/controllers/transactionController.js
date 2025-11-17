const { Transaction } = require('../models');

async function addTransaction(tx) {
  const payload = {
    transactionType: tx.transactionType,
    amount: tx.amount,
    occurredOn: tx.occurredOn,
    description: tx.description || null,
    userEmail: tx.userEmail,
    status: typeof tx.status === 'number' ? tx.status : 1
  };

  const created = await Transaction.create(payload);
  return { success: true, transaction: created.get({ plain: true }) };
}

async function listTransactions(userEmail) {
  const results = await Transaction.findAll({
    where: { userEmail },
    order: [
      ['occurredOn', 'DESC'],
      ['id', 'DESC']
    ]
  });

  return results.map(record => record.get({ plain: true }));
}

async function deleteTransaction({ id, userEmail }) {
  const deleted = await Transaction.destroy({
    where: { id, userEmail }
  });

  return { success: deleted > 0 };
}

module.exports = {
  addTransaction,
  listTransactions,
  deleteTransaction
};
