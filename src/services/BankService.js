import { createBankRepository } from '../platform/RepositoryFactory';

export class BankService {
  constructor(repository = createBankRepository()) {
    this.repository = repository;
  }

  async listBanks() {
    return this.repository.listBanks();
  }

  async addBank(bank) {
    return this.repository.addBank(bank);
  }

  async setBankStatus(id) {
    return this.repository.setBankStatus(id);
  }
}

export const bankService = new BankService();
export default bankService;
