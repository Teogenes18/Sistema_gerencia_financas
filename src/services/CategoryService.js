import { createCategoryRepository } from '../platform/RepositoryFactory';

export class CategoryService {
  constructor(repository = createCategoryRepository()) {
    this.repository = repository;
  }

  async listCategories() {
    return this.repository.listCategories();
  }
}

export const categoryService = new CategoryService();
export default categoryService;
