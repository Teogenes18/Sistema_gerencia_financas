import { useState, useEffect } from 'react';

export default function App() {
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

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Gerencia Finanças</h1>

      <form onSubmit={salvar} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 12 }}>
        <h2>Nova Transação</h2>
        <label>Tipo</label>
        <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        <label>Valor</label>
        <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
        <label>Data</label>
        <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
        <label>Descrição</label>
        <input type="text" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
        <button type="submit">Salvar Transação</button>
      </form>

      <div style={{ border: '1px solid #ccc', padding: 12 }}>
        <h2>Extrato</h2>
        {transacoes.length === 0 && <p>Nenhuma transação cadastrada.</p>}
        {transacoes.map(t => {
          const valorFormatado = Number(t.valor).toFixed(2).replace('.', ',');
          const sinal = t.tipo === 'receita' ? '+ R$ ' : '- R$ ';
          const [ano, mes, dia] = t.data.split('-');
          return (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px dotted #eee' }}>
              <div>{`${dia}/${mes}/${ano} - ${t.descricao}`}</div>
              <div style={{ color: t.tipo === 'receita' ? 'green' : 'red', fontWeight: 'bold' }}>{sinal + valorFormatado}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
