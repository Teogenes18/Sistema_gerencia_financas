import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [apiMessage, setApiMessage] = useState('');
  const { login, userExists } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      const result = await login(data);
      setApiMessage(result.message);
      
      if (result.success) {
        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setApiMessage('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="E-mail"
          {...register('email', {
            required: 'Por favor, preencha o e-mail',
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: 'E-mail inválido'
            }
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Senha"
          {...register('senha', {
            required: 'Por favor, preencha a senha'
          })}
        />
        {errors.senha && <p className="error">{errors.senha.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      {apiMessage && <p className="mensagem">{apiMessage}</p>}
      
      {!userExists && (
        <p style={{ marginTop: '10px' }}>
          Ainda não tem uma conta?{' '}
          <Link 
            to="/register"
            style={{ color: 'blue', textDecoration: 'none' }}
          >
            Cadastre-se
          </Link>
        </p>
      )}
    </div>
  );
}