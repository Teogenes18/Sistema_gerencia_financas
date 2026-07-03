import { BankRepository } from '../BankRepository';
import { apiClient } from '../../api';

export class ElectronBankRepository extends BankRepository {
  async listBanks() {
    return apiClient.listBanks();
  }

  async addBank(bank) {
    return apiClient.addBank(bank);
  }

  async setBankStatus(id) {
    return apiClient.setBankStatus(id);
  }
}

export default ElectronBankRepository;
