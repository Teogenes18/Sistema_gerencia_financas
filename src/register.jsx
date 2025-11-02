import { useState } from 'react';

export default function Register({ onRegistered, onGoToLogin }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMensagem('');
    if (!form.nome.trim()) {
      setMensagem('Por favor, preencha o nome');
      return;
    }
    
    if (!form.email.trim()) {
      setMensagem('Por favor, preencha o e-mail');
      return;
    }
    
    if (!form.senha) {
      setMensagem('Por favor, preencha a senha');
      return;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email)) {
      setMensagem('E-mail inválido');
      return;
    }

    if (form.senha.length < 8) {
      setMensagem('A senha deve ter no mínimo 8 caracteres');
      return;
    }
    
    if (!/[A-Za-z]/.test(form.senha)) {
      setMensagem('A senha deve conter letras');
      return;
    }
    
    if (!/[0-9]/.test(form.senha)) {
      setMensagem('A senha deve conter números');
      return;
    }

    try {
      const res = await window.api.registerUser(form);
      setMensagem(res.message);
      
      if (res.success) {
        setTimeout(() => onRegistered(), 1500);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setMensagem('Erro ao tentar cadastrar. Tente novamente.');
    }
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
          placeholder="Senha (mínimo 8 caracteres, com letras e números)"
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