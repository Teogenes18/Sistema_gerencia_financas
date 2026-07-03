import { createTransactionRepository } from '../platform/RepositoryFactory';

export class TransactionService {
  constructor(repository = createTransactionRepository()) {
    this.repository = repository;
  }

  async addTransaction(transaction) {
    return this.repository.addTransaction(transaction);
  }

  async listTransactions(userEmail) {
    return this.repository.listTransactions(userEmail);
  }

  async deleteTransaction(payload) {
    return this.repository.deleteTransaction(payload);
  }

  async updateTransactionStatus(id, userEmail, status) {
    return this.repository.updateTransactionStatus(id, userEmail, status);
  }

  async updateTransaction(id, userEmail, updates) {
    return this.repository.updateTransaction(id, userEmail, updates);
  }
}

export const transactionService = new TransactionService();
export default transactionService;
