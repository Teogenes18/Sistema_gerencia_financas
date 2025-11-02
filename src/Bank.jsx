import { useState } from 'react';

export default function Bank({ onBackToHome }) {
  const [form, setForm] = useState({ nome: '', saldo: '' });
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setTipo('');

    if (!form.nome.trim()) {
      setMensagem('⚠️ O nome do banco não pode estar vazio.');
      setTipo('erro');
      return;
    }

    if (!form.saldo || form.saldo.trim() === '') {
      setMensagem('⚠️ O saldo inicial é obrigatório.');
      setTipo('erro');
      return;
    }

    const saldoNumerico = parseFloat(form.saldo);
    if (isNaN(saldoNumerico)) {
      setMensagem('⚠️ O saldo inicial deve ser um número válido.');
      setTipo('erro');
      return;
    }

    if (saldoNumerico < 0) {
      setMensagem('⚠️ O saldo inicial não pode ser negativo.');
      setTipo('erro');
      return;
    }

    try {
      const result = await window.api.addBank({
        nome: form.nome.trim(),
        saldo: saldoNumerico
      });

      if (result.success) {
        setMensagem('✅ Banco cadastrado com sucesso!');
        setTipo('sucesso');
        setForm({ nome: '', saldo: '' });
        
        setTimeout(() => {
          onBackToHome();
        }, 1500);
      } else {
        setMensagem('❌ ' + result.message);
        setTipo('erro');
      }
    } catch (error) {
      console.error(error);
      setMensagem('❌ Erro ao cadastrar banco. Tente novamente.');
      setTipo('erro');
    }
  };

  return (
    <div className="container">
      <h1>Gerenciandor Financeiro</h1>
      <h2>Cadastrar Banco</h2>

      <form onSubmit={handleSubmit}>
        <label>Nome do Banco</label>
        <input
          type="text"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          placeholder="Ex: Banco do Brasil, Nubank, Caixa..."
        />

        <label>Saldo Inicial</label>
        <input
          type="number"
          step="0.01"
          value={form.saldo}
          onChange={e => setForm({ ...form, saldo: e.target.value })}
          placeholder="Ex: 1500.00"
        />

        <button type="submit" style={{ backgroundColor: '#2196F3' }}>
          Salvar Banco
        </button>
      </form>

      {mensagem && (
        <p 
          className="mensagem"
          style={{ 
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: tipo === 'sucesso' ? '#d4edda' : '#f8d7da',
            color: tipo === 'sucesso' ? '#155724' : '#721c24',
            border: `1px solid ${tipo === 'sucesso' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {mensagem}
        </p>
      )}

      <button
        onClick={onBackToHome}
        style={{
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px',
          fontWeight: 'bold'
        }}
      >
        Voltar
      </button>
    </div>
  );
}