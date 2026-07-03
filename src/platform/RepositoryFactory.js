import { ElectronPlatformAdapter } from './electron/ElectronPlatformAdapter';
import { WebPlatformAdapter } from './web/WebPlatformAdapter';

const getPlatformAdapter = () => {
  if (typeof window !== 'undefined' && window.__ELECTRON__) {
    return new ElectronPlatformAdapter();
  }

  return new WebPlatformAdapter();
};

export function createUserRepository() {
  return getPlatformAdapter().createUserRepository();
}

export function createBankRepository() {
  return getPlatformAdapter().createBankRepository();
}

export function createCategoryRepository() {
  return getPlatformAdapter().createCategoryRepository();
}

export function createTransactionRepository() {
  return getPlatformAdapter().createTransactionRepository();
}

export default createUserRepository;
