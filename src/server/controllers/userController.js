const bcrypt = require('bcrypt');
const { User } = require('../models');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function registerUser(user) {
  const { nome, email, senha } = user;

  if (!nome || !email || !senha) {
    return { success: false, message: 'Preencha todos os campos.' };
  }

  const existingUser = await User.findByPk(email);
  if (existingUser) {
    return { success: false, message: 'Este e-mail já está cadastrado.' };
  }

  if (!emailRegex.test(email)) {
    return { success: false, message: 'E-mail inválido.' };
  }

  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
    return { success: false, message: 'A senha deve ter ao menos 8 caracteres, com letras e números.' };
  }

  const hash = await bcrypt.hash(senha, 10);
  await User.create({ fullName: nome, email, passwordHash: hash });

  return { success: true, message: 'Usuário cadastrado com sucesso.' };
}

async function loginUser(credentials) {
  const { email, senha } = credentials;

  if (!email || !senha) {
    return { success: false, message: 'Preencha e-mail e senha.' };
  }

  const user = await User.findByPk(email);
  if (!user) {
    return { success: false, message: 'E-mail ou senha inválidos.' };
  }

  const senhaOk = await bcrypt.compare(senha, user.passwordHash);
  if (!senhaOk) {
    return { success: false, message: 'E-mail ou senha inválidos.' };
  }

  return {
    success: true,
    message: 'Login bem-sucedido.',
    userId: user.email,
    nome: user.fullName
  };
}

async function checkUserExists() {
  const count = await User.count();
  return { userExists: count > 0 };
}

module.exports = {
  registerUser,
  loginUser,
  checkUserExists
};
