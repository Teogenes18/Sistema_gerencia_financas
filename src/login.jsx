import { useState } from 'react';

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    try {
      const res = await window.api.loginUser(form);
      setMensagem(res.message);
      
      if (res.success) {
        setTimeout(() => onLoginSuccess(res.userId, res.nome), 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMensagem('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Entrar</button>
      </form>
      {mensagem && <p className="mensagem">{mensagem}</p>}
      <p style={{ marginTop: '10px' }}>
        Ainda não tem uma conta?{' '}
        <button
          type="button"
          onClick={onGoToRegister}
          style={{ background: 'none', color: 'blue', border: 'none', cursor: 'pointer' }}
        >
          Cadastre-se
        </button>
      </p>
    </div>
  );
}