import { ElectronUserRepository } from '../../repositories/electron/ElectronUserRepository';
import { ElectronBankRepository } from '../../repositories/electron/ElectronBankRepository';
import { ElectronCategoryRepository } from '../../repositories/electron/ElectronCategoryRepository';
import { ElectronTransactionRepository } from '../../repositories/electron/ElectronTransactionRepository';
import { PlatformAdapter } from '../PlatformAdapter';

export class ElectronPlatformAdapter extends PlatformAdapter {
  createUserRepository() {
    return new ElectronUserRepository();
  }

  createBankRepository() {
    return new ElectronBankRepository();
  }

  createCategoryRepository() {
    return new ElectronCategoryRepository();
  }

  createTransactionRepository() {
    return new ElectronTransactionRepository();
  }
}

export default ElectronPlatformAdapter;
