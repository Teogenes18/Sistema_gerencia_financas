import { UserRepository } from '../UserRepository';
import { apiClient } from '../../api';

export class ElectronUserRepository extends UserRepository {
  async registerUser(user) {
    return apiClient.registerUser(user);
  }

  async loginUser(credentials) {
    return apiClient.loginUser(credentials);
  }

  async checkUserExists() {
    return apiClient.checkUserExists();
  }
}

export default ElectronUserRepository;
