const { Transaction, Category, Bank } = require('../models');

async function addTransaction(tx) {
  if (tx.categoryId == null) {
    return { success: false, message: 'Categoria é obrigatório' };
  }

  const payload = {
    transactionType: tx.transactionType,
    amount: tx.amount,
    occurredOn: tx.occurredOn,
    description: tx.description || null,
    categoryId: tx.categoryId,
    bankId: typeof tx.bankId !== 'undefined' ? tx.bankId : null,
    userEmail: tx.userEmail,
    status: typeof tx.status === 'number' ? tx.status : 1
  };

  const created = await Transaction.create(payload);
  return { success: true, transaction: created.get({ plain: true }) };
}

async function listTransactions(userEmail) {
  const results = await Transaction.findAll({
    where: { userEmail },
    include:[{
        model: Category,
        as: 'category', 
        attributes: ['id', 'name']
      }
      ,{
        model: Bank,
        as: 'bank',
        attributes: ['id', 'name', 'isActive']
      }
    ],
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

async function updateTransactionStatus(id, userEmail, newStatus) {
  try {
    const [updated] = await Transaction.update(
      { status: newStatus },
      { 
        where: { 
          id, 
          userEmail 
        } 
      }
    );
    return { success: updated > 0 };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

async function updateTransaction(id, userEmail, updates) {
  try {
    const [updated] = await Transaction.update(
      {
        description: updates.description || undefined,
        amount: updates.amount !== undefined ? updates.amount : undefined,
        occurredOn: updates.occurredOn || undefined,
        categoryId: updates.categoryId || undefined,
        bankId: updates.bankId || undefined
      },
      { 
        where: { 
          id, 
          userEmail 
        }
      }
    );
    return { success: updated > 0, message: 'Transação atualizada com sucesso.' };
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
}

module.exports = {
  addTransaction,
  listTransactions,
  deleteTransaction,
  updateTransactionStatus,
  updateTransaction
};
