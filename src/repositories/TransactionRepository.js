export class TransactionRepository {
  async addTransaction(transaction) {
    throw new Error('addTransaction must be implemented by a platform repository.');
  }

  async listTransactions(userEmail) {
    throw new Error('listTransactions must be implemented by a platform repository.');
  }

  async deleteTransaction(payload) {
    throw new Error('deleteTransaction must be implemented by a platform repository.');
  }

  async updateTransactionStatus(id, userEmail, status) {
    throw new Error('updateTransactionStatus must be implemented by a platform repository.');
  }

  async updateTransaction(id, userEmail, updates) {
    throw new Error('updateTransaction must be implemented by a platform repository.');
  }
}

export default TransactionRepository;
