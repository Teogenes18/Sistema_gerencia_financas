export class BankRepository {
  async listBanks() {
    throw new Error('listBanks must be implemented by a platform repository.');
  }

  async addBank(bank) {
    throw new Error('addBank must be implemented by a platform repository.');
  }

  async setBankStatus(id) {
    throw new Error('setBankStatus must be implemented by a platform repository.');
  }
}

export default BankRepository;
