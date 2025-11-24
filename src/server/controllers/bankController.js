const { Bank } = require('../models');

async function addBank(bank) {
  const { nome, saldo } = bank;

  if (!nome || nome.trim() === '') {
    return { success: false, message: 'O nome do banco é obrigatório.' };
  }

  const valorSaldo = parseFloat(saldo);
  if (Number.isNaN(valorSaldo)) {
    return { success: false, message: 'O saldo inicial deve ser um número válido.' };
  }

  await Bank.create({
    name: nome.trim(),
    balance: valorSaldo,
    isActive: true
  });

  return { success: true, message: 'Banco cadastrado com sucesso.' };
}

async function listBanks() {
  const banks = await Bank.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
  return banks.map(b => b.get({ plain: true }));
}

module.exports = {
  addBank
 ,listBanks
};
