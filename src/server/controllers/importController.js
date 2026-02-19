const { Transaction, Bank, Category } = require('../models');

async function validateImportFile(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { valid: false, message: 'Arquivo vazio ou inválido.' };
  }

  const required = ['amount', 'description', 'transactionType', 'occurredOn'];
  const sample = transactions[0];

  for (const field of required) {
    if (!(field in sample) || !sample[field]) {
      return { 
        valid: false, 
        message: `Campo obrigatório ausente ou vazio: ${field}. Verifique o formato do arquivo.` 
      };
    }
  }

  return { valid: true, message: 'Arquivo válido.', count: transactions.length };
}

async function importTransactions(userEmail, transactions, selectedBankId) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { success: false, message: '❌ Nenhuma transação para importar.' };
  }

  const results = {
    imported: 0,
    failed: 0,
    errors: []
  };

  try {
    let bankId = selectedBankId;
    if (bankId) {
      const bank = await Bank.findByPk(bankId);
      if (!bank) {
        return { success: false, message: '❌ Banco selecionado não encontrado.' };
      }
    }

    for (let i = 0; i < transactions.length; i++) {
      try {
        const tx = transactions[i];

        if (!tx.amount || !tx.description || !tx.transactionType || !tx.occurredOn) {
          results.errors.push(`Linha ${i + 1}: Campos obrigatórios ausentes`);
          results.failed++;
          continue;
        }

        const tipo = String(tx.transactionType).toLowerCase().trim();
        let tipoValido = 'despesa';
        if (['receita', 'income', 'entrada', 'renda'].includes(tipo)) {
          tipoValido = 'receita';
        } else if (['despesa', 'expense', 'saída', 'gasto'].includes(tipo)) {
          tipoValido = 'despesa';
        } else {
          results.errors.push(`Linha ${i + 1}: Tipo de transação inválido (use "receita" ou "despesa")`);
          results.failed++;
          continue;
        }

        // Validar valor
        const amount = parseFloat(String(tx.amount).replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
          results.errors.push(`Linha ${i + 1}: Valor inválido`);
          results.failed++;
          continue;
        }

        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(tx.occurredOn)) {
          results.errors.push(`Linha ${i + 1}: Data em formato inválido (use YYYY-MM-DD)`);
          results.failed++;
          continue;
        }

        let categoryId = tx.categoryId;
        if (!categoryId) {
          const defaultCat = tipoValido === 'receita' ? 1 : 3;
          categoryId = defaultCat;
        } else {
          const category = await Category.findByPk(categoryId);
          if (!category) {
            results.errors.push(`Linha ${i + 1}: Categoria não encontrada`);
            results.failed++;
            continue;
          }
        }

        await Transaction.create({
          transactionType: tipoValido,
          amount: amount,
          occurredOn: tx.occurredOn,
          description: (tx.description || '').substring(0, 255).trim(),
          categoryId: categoryId,
          bankId: bankId || null,
          userEmail: userEmail,
          status: tx.status || 1
        });

        results.imported++;
      } catch (error) {
        results.errors.push(`Linha ${i + 1}: ${error.message}`);
        results.failed++;
      }
    }

    return {
      success: true,
      message: `✅ Importação concluída: ${results.imported} transações importadas, ${results.failed} falharam.`,
      results
    };
  } catch (error) {
    console.error('Erro ao importar transações:', error);
    return { success: false, message: '❌ Erro ao importar transações.' };
  }
}

module.exports = {
  importTransactions,
  validateImportFile
};