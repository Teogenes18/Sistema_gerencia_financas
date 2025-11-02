import { useState, useEffect } from 'react';
import { FiLogOut,FiTrash2 } from 'react-icons/fi'; 

export default function Home({ user, onLogout,onGoToBank }) {
  const [transacoes, setTransacoes] = useState([]);
  const [form, setForm] = useState({ tipo: 'receita', valor: '', data: '', descricao: '' });

  const carregar = async () => {
    try {
      const data = await window.api.listTransactions();
      setTransacoes(data);
    } catch (err) {
      console.error(err);
      setTransacoes([]);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.valor || !form.data || !form.descricao.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    await window.api.addTransaction({
      tipo: form.tipo,
      valor: parseFloat(form.valor),
      data: form.data,
      descricao: form.descricao.trim()
    });

    setForm({ tipo: 'receita', valor: '', data: '', descricao: '' });
    carregar();
  };

  const excluir = async (id) => {
    const confirmar = confirm('Tem certeza que deseja excluir esta transação?');
    if (!confirmar) return;

    try {
      await window.api.deleteTransaction(id);
      carregar();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gerenciandor Financeiro</h1>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#e74c3c', 
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          <FiLogOut style={{ marginRight: '5px' }} />
          Logout
        </button>
      </div>

      <h2>Bem-vindo, {user.nome}!</h2>

      {onGoToBank && (
        <button
          onClick={onGoToBank}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px',
            fontSize: '16px'
          }}
        >
          + Cadastrar Banco
        </button>
      )}

      <form onSubmit={salvar}>
        <h2>Nova Transação</h2>

        <label>Tipo</label>
        <select
          value={form.tipo}
          onChange={e => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>

        <label>Valor</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={form.valor}
          onChange={e => setForm({ ...form, valor: e.target.value })}
        />

        <label>Data</label>
        <input
          type="date"
          value={form.data}
          onChange={e => setForm({ ...form, data: e.target.value })}
        />

        <label>Descrição</label>
        <input
          type="text"
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />

        <button type="submit">Salvar Transação</button>
      </form>

      <div className="extrato">
        <h2>Extrato</h2>
        {transacoes.length === 0 && <p>Nenhuma transação cadastrada.</p>}

        {transacoes.map(t => {
          const valorFormatado = Number(t.valor).toFixed(2).replace('.', ',');
          const sinal = t.tipo === 'receita' ? '+ R$ ' : '- R$ ';
          const [ano, mes, dia] = t.data.split('-');

          return (
            <div key={t.id} className="item">
              <div>{`${dia}/${mes}/${ano} - ${t.descricao}`}</div>
              <div className={t.tipo === 'receita' ? 'valor-receita' : 'valor-despesa'}>
                {sinal + valorFormatado}

                <button
                  className="btn-excluir"
                  onClick={() => excluir(t.id)}
                  title="Excluir transação"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
