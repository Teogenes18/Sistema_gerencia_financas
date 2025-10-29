import { useState } from 'react';

export default function Register({ onRegistered, onGoToLogin }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await window.api.registerUser(form);
    setMensagem(res.message);
    if (res.success) setTimeout(() => onRegistered(), 1500);
  };

  return (
    <div className="container">
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={e => setForm({ ...form, senha: e.target.value })}
        />
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p className="mensagem">{mensagem}</p>}
      <p style={{ marginTop: '10px' }}>
        Já possui uma conta?{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          style={{ background: 'none', color: 'blue', border: 'none', cursor: 'pointer' }}
        >
          Login
        </button>
      </p>
    </div>
  );
}
