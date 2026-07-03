import bcrypt from 'bcryptjs';

const STORAGE_KEYS = {
  users: 'finance-app-users',
  transactions: 'finance-app-transactions',
  banks: 'finance-app-banks',
  categories: 'finance-app-categories'
};

const isBrowserDevEnvironment = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && !window.__ELECTRON__;
};

const readStorage = (key) => {
  if (!isBrowserDevEnvironment()) return [];
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.warn('Erro ao ler storage local:', error);
    return [];
  }
};

const writeStorage = (key, value) => {
  if (!isBrowserDevEnvironment()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getFallbackApi = () => ({
  registerUser: async (user) => {
    const users = readStorage(STORAGE_KEYS.users);
    const email = user?.email?.trim().toLowerCase();
    if (!email || !user?.nome || !user?.senha) {
      return { success: false, message: 'Preencha todos os campos.' };
    }

    const exists = users.some((storedUser) => storedUser.email === email);
    if (exists) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const passwordHash = bcrypt.hashSync(user.senha, 10);
    const nextUser = {
      email,
      fullName: user.nome,
      passwordHash
    };

    writeStorage(STORAGE_KEYS.users, [...users, nextUser]);
    return { success: true, message: 'Usuário cadastrado com sucesso.' };
  },

  loginUser: async (credentials) => {
    const users = readStorage(STORAGE_KEYS.users);
    const email = credentials?.email?.trim().toLowerCase();
    const senha = credentials?.senha;

    const user = users.find((storedUser) => storedUser.email === email);
    if (!user) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    const senhaOk = bcrypt.compareSync(senha, user.passwordHash);
    if (!senhaOk) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    return {
      success: true,
      message: 'Login bem-sucedido.',
      userId: user.email,
      nome: user.fullName
    };
  },

  checkUserExists: async () => {
    const users = readStorage(STORAGE_KEYS.users);
    return { userExists: users.length > 0 };
  },

  listTransactions: async (userEmail) => {
    const transactions = readStorage(STORAGE_KEYS.transactions);
    return transactions.filter((tx) => tx.userEmail === userEmail);
  },

  addTransaction: async (tx) => {
    const transactions = readStorage(STORAGE_KEYS.transactions);
    const created = { ...tx, id: Date.now() };
    writeStorage(STORAGE_KEYS.transactions, [...transactions, created]);
    return { success: true, transaction: created };
  },

  listCategories: async () => {
    return readStorage(STORAGE_KEYS.categories).length > 0
      ? readStorage(STORAGE_KEYS.categories)
      : [
          { id: 1, name: 'Salário' },
          { id: 2, name: 'Conta' },
          { id: 3, name: 'Alimentação' },
          { id: 4, name: 'Saúde' },
          { id: 5, name: 'Transporte' },
          { id: 6, name: 'Lazer' },
          { id: 7, name: 'Aluguel' },
          { id: 8, name: 'Investimento' }
        ];
  },

  listBanks: async () => readStorage(STORAGE_KEYS.banks),

  deleteTransaction: async (id, userEmail) => {
    const transactions = readStorage(STORAGE_KEYS.transactions);
    const filtered = transactions.filter((tx) => !(tx.id === id && tx.userEmail === userEmail));
    writeStorage(STORAGE_KEYS.transactions, filtered);
    return { success: true };
  },

  addBank: async (bank) => {
    const banks = readStorage(STORAGE_KEYS.banks);
    const created = { id: Date.now(), ...bank, isActive: true };
    writeStorage(STORAGE_KEYS.banks, [...banks, created]);
    return { success: true, message: 'Banco cadastrado com sucesso.' };
  },

  setBankStatus: async (id) => {
    const banks = readStorage(STORAGE_KEYS.banks);
    const updated = banks.map((bank) => bank.id === id ? { ...bank, isActive: !bank.isActive } : bank);
    writeStorage(STORAGE_KEYS.banks, updated);
    return { success: true, message: 'Banco atualizado com sucesso.' };
  },

  updateTransactionStatus: async (id, userEmail, status) => {
    const transactions = readStorage(STORAGE_KEYS.transactions);
    const updated = transactions.map((tx) => tx.id === id && tx.userEmail === userEmail ? { ...tx, status } : tx);
    writeStorage(STORAGE_KEYS.transactions, updated);
    return { success: true };
  },

  updateTransaction: async (id, userEmail, updates) => {
    const transactions = readStorage(STORAGE_KEYS.transactions);
    const updated = transactions.map((tx) => tx.id === id && tx.userEmail === userEmail ? { ...tx, ...updates } : tx);
    writeStorage(STORAGE_KEYS.transactions, updated);
    return { success: true, message: 'Transação atualizada com sucesso.' };
  },

  validateImportFile: async (transactions) => ({ valid: true, message: 'Arquivo válido.', count: transactions.length }),

  importTransactions: async (userEmail, transactions) => {
    const existing = readStorage(STORAGE_KEYS.transactions);
    const imported = transactions.map((tx, index) => ({ ...tx, id: Date.now() + index, userEmail }));
    writeStorage(STORAGE_KEYS.transactions, [...existing, ...imported]);
    return { success: true, message: 'Importação concluída.', results: { imported: imported.length, failed: 0, errors: [] } };
  }
});

const getApi = () => (typeof window !== 'undefined' ? window.api : undefined);

const callPlatformApi = (methodName, args = []) => {
  const api = getApi();

  if (api && typeof api[methodName] === 'function') {
    return api[methodName](...args);
  }

  if (isBrowserDevEnvironment()) {
    const fallbackApi = getFallbackApi();
    if (fallbackApi && typeof fallbackApi[methodName] === 'function') {
      return fallbackApi[methodName](...args);
    }
  }

  return Promise.reject(new Error(`A API "${methodName}" não está disponível neste ambiente.`));
};

export const apiClient = {
  registerUser: (user) => callPlatformApi('registerUser', [user]),
  loginUser: (credentials) => callPlatformApi('loginUser', [credentials]),
  checkUserExists: () => callPlatformApi('checkUserExists'),
  addTransaction: (tx) => callPlatformApi('addTransaction', [tx]),
  listTransactions: (userEmail) => callPlatformApi('listTransactions', [userEmail]),
  listCategories: () => callPlatformApi('listCategories'),
  listBanks: () => callPlatformApi('listBanks'),
  deleteTransaction: (id, userEmail) => callPlatformApi('deleteTransaction', [id, userEmail]),
  addBank: (bank) => callPlatformApi('addBank', [bank]),
  setBankStatus: (id) => callPlatformApi('setBankStatus', [id]),
  updateTransactionStatus: (id, userEmail, status) => callPlatformApi('updateTransactionStatus', [id, userEmail, status]),
  updateTransaction: (id, userEmail, updates) => callPlatformApi('updateTransaction', [id, userEmail, updates]),
  validateImportFile: (transactions) => callPlatformApi('validateImportFile', [transactions]),
  importTransactions: (userEmail, transactions, bankId) => callPlatformApi('importTransactions', [userEmail, transactions, bankId])
};

if (typeof window !== 'undefined') {
  window.__ELECTRON__ = typeof window.__ELECTRON__ !== 'undefined' ? window.__ELECTRON__ : false;
  window.api = window.api || apiClient;
}

export default apiClient;
