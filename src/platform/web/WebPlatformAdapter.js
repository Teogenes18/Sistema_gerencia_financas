import { PlatformAdapter } from '../PlatformAdapter';

export class WebPlatformAdapter extends PlatformAdapter {
  createUserRepository() {
    throw new Error('Web platform adapter is not implemented yet.');
  }

  createBankRepository() {
    throw new Error('Web platform adapter is not implemented yet.');
  }

  createCategoryRepository() {
    throw new Error('Web platform adapter is not implemented yet.');
  }

  createTransactionRepository() {
    throw new Error('Web platform adapter is not implemented yet.');
  }
}

export default WebPlatformAdapter;
