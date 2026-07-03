export class PlatformAdapter {
  createUserRepository() {
    throw new Error('createUserRepository must be implemented by the platform adapter.');
  }

  createBankRepository() {
    throw new Error('createBankRepository must be implemented by the platform adapter.');
  }

  createCategoryRepository() {
    throw new Error('createCategoryRepository must be implemented by the platform adapter.');
  }

  createTransactionRepository() {
    throw new Error('createTransactionRepository must be implemented by the platform adapter.');
  }
}

export default PlatformAdapter;
