import { TransactionRepository } from '../TransactionRepository';
import { apiClient } from '../../api';

export class ElectronTransactionRepository extends TransactionRepository {
  async addTransaction(transaction) {
    return apiClient.addTransaction(transaction);
  }

  async listTransactions(userEmail) {
    return apiClient.listTransactions(userEmail);
  }

  async deleteTransaction(payload) {
    return apiClient.deleteTransaction(payload.id, payload.userEmail);
  }

  async updateTransactionStatus(id, userEmail, status) {
    return apiClient.updateTransactionStatus(id, userEmail, status);
  }

  async updateTransaction(id, userEmail, updates) {
    return apiClient.updateTransaction(id, userEmail, updates);
  }
}

export default ElectronTransactionRepository;
