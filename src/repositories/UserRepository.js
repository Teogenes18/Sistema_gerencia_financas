export class UserRepository {
  async registerUser(user) {
    throw new Error('registerUser must be implemented by a platform repository.');
  }

  async loginUser(credentials) {
    throw new Error('loginUser must be implemented by a platform repository.');
  }

  async checkUserExists() {
    throw new Error('checkUserExists must be implemented by a platform repository.');
  }
}

export default UserRepository;
