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
  const banks = await Bank.findAll({ attributes: ['id', 'name', 'balance', 'isActive'], order: [['name', 'ASC']] });
  return banks.map(b => b.get({ plain: true }));
}

async function setBankStatus(id) {
  try {
    const bank = await Bank.findByPk(id);
    if (!bank) {
      return { success: false, message: 'Banco não encontrado.' };
    }
    
    bank.isActive = !bank.isActive;
    await bank.save();
    
    const statusMsg = bank.isActive ? 'ativado' : 'desativado';
    return { success: true, message: `Banco ${statusMsg} com sucesso.` };
  } catch (error) {
    console.error('Erro ao alterar status do banco:', error);
    return { success: false, message: 'Erro ao alterar status.' };
  }
}

module.exports = {
  addBank,
  listBanks,
  setBankStatus
};