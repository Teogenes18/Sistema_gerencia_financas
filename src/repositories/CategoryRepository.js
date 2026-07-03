export class CategoryRepository {
  async listCategories() {
    throw new Error('Método listCategories deve ser implementado pela plataforma específica.');
  }
}

export default CategoryRepository;
