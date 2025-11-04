import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerForm, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const [apiMessage, setApiMessage] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      const result = await registerUser(data);
      setApiMessage(result.message);
      
      if (result.success) {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setApiMessage('Erro ao tentar cadastrar. Tente novamente.');
    }
  };

  return (
    <div className="container">
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Nome"
          {...registerForm('nome', {
            required: 'Por favor, preencha o nome',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres'
            }
          })}
        />
        {errors.nome && <p className="error">{errors.nome.message}</p>}

        <input
          type="email"
          placeholder="E-mail"
          {...registerForm('email', {
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
          placeholder="Senha (mínimo 8 caracteres, com letras e números)"
          {...registerForm('senha', {
            required: 'Por favor, preencha a senha',
            minLength: {
              value: 8,
              message: 'A senha deve ter no mínimo 8 caracteres'
            },
            validate: {
              hasLetter: (value) => 
                /[A-Za-z]/.test(value) || 'A senha deve conter letras',
              hasNumber: (value) => 
                /[0-9]/.test(value) || 'A senha deve conter números'
            }
          })}
        />
        {errors.senha && <p className="error">{errors.senha.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      
      {apiMessage && <p className="mensagem">{apiMessage}</p>}
      
      <p style={{ marginTop: '10px' }}>
        Já possui uma conta?{' '}
        <Link 
          to="/login"
          style={{ color: 'blue', textDecoration: 'none' }}
        >
          Login
        </Link>
      </p>
    </div>
  );
}