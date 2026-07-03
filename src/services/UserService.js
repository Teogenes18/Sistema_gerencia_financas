import { createUserRepository } from '../platform/RepositoryFactory';

export class UserService {
  constructor(repository = createUserRepository()) {
    this.repository = repository;
  }

  async registerUser(user) {
    return this.repository.registerUser(user);
  }

  async loginUser(credentials) {
    return this.repository.loginUser(credentials);
  }

  async checkUserExists() {
    return this.repository.checkUserExists();
  }
}

export const userService = new UserService();
export default userService;
