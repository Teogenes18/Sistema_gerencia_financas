import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function Bank() {
  const navigate = useNavigate();
  const [apiMessage, setApiMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      setMessageType('');

      const result = await window.api.addBank({
        nome: data.nome.trim(),
        saldo: parseFloat(data.saldo)
      });

      if (result.success) {
        setApiMessage('✅ Banco cadastrado com sucesso!');
        setMessageType('sucesso');
        reset();
        
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setApiMessage('❌ ' + result.message);
        setMessageType('erro');
      }
    } catch (error) {
      console.error(error);
      setApiMessage('❌ Erro ao cadastrar banco. Tente novamente.');
      setMessageType('erro');
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="container">
      <h1>Gerenciador Financeiro</h1>
      <h2>Cadastrar Banco</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Nome do Banco</label>
        <input
          type="text"
          placeholder="Ex: Banco do Brasil, Nubank, Caixa..."
          {...register('nome', {
            required: 'O nome do banco é obrigatório',
            minLength: {
              value: 2,
              message: 'O nome deve ter pelo menos 2 caracteres'
            },
            validate: {
              notEmpty: (value) => 
                value.trim().length > 0 || 'O nome não pode estar vazio'
            }
          })}
        />
        {errors.nome && <p className="error">{errors.nome.message}</p>}

        <label>Saldo Inicial</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 1500.00"
          {...register('saldo', {
            required: 'O saldo inicial é obrigatório',
            min: {
              value: 0,
              message: 'O saldo não pode ser negativo'
            },
            validate: {
              isNumber: (value) => 
                !isNaN(parseFloat(value)) || 'O saldo deve ser um número válido'
            }
          })}
        />
        {errors.saldo && <p className="error">{errors.saldo.message}</p>}

        <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#2196F3' }}>
          {isSubmitting ? 'Salvando...' : 'Salvar Banco'}
        </button>
      </form>

      {apiMessage && (
        <p 
          className="mensagem"
          style={{ 
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: messageType === 'sucesso' ? '#d4edda' : '#f8d7da',
            color: messageType === 'sucesso' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'sucesso' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {apiMessage}
        </p>
      )}

      <button
        onClick={goBack}
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