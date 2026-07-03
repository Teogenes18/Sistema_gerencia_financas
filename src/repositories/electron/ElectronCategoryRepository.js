import { apiClient } from '../../api';

export class ElectronCategoryRepository {
  async listCategories() {
    return apiClient.listCategories();
  }
}

export default ElectronCategoryRepository;
