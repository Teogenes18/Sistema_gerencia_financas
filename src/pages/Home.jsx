import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiTrash2 } from 'react-icons/fi'; 
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      tipo: 'receita',
      valor: '',
      data: '',
      descricao: ''
    }
  });

  const carregar = async () => {
    try {
      const data = await window.api.listTransactions(user.id);
      setTransacoes(data);
    } catch (err) {
      console.error(err);
      setTransacoes([]);
    }
  };

  const onSubmit = async (data) => {
    try {
      await window.api.addTransaction({
        tipo: data.tipo,
        valor: parseFloat(data.valor),
        data: data.data,
        descricao: data.descricao.trim(),
        userEmail: user.id
      });

      reset();
      carregar();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  const excluir = async (id) => {
    const confirmar = confirm('Tem certeza que deseja excluir esta transação?');
    if (!confirmar) return;

    try {
      await window.api.deleteTransaction(id,user.id);
      carregar();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToBank = () => {
    navigate('/bank');
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gerenciador Financeiro</h1>
        <button
          onClick={handleLogout}
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

      <h2>Bem-vindo, {user?.nome}!</h2>

      <button
        onClick={goToBank}
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Nova Transação</h2>

        <label>Tipo</label>
        <select
          {...register('tipo', {
            required: 'Selecione o tipo de transação'
          })}
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        {errors.tipo && <p className="error">{errors.tipo.message}</p>}

        <label>Valor</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('valor', {
            required: 'Por favor, preencha o valor',
            min: {
              value: 0.01,
              message: 'O valor deve ser maior que zero'
            },
            validate: {
              isPositive: (value) => 
                parseFloat(value) > 0 || 'O valor deve ser maior que zero'
            }
          })}
        />
        {errors.valor && <p className="error">{errors.valor.message}</p>}

        <label>Data</label>
        <input
          type="date"
          {...register('data', {
            required: 'Por favor, selecione uma data'
          })}
        />
        {errors.data && <p className="error">{errors.data.message}</p>}

        <label>Descrição</label>
        <input
          type="text"
          placeholder="Descrição da transação"
          {...register('descricao', {
            required: 'Por favor, preencha a descrição',
            minLength: {
              value: 3,
              message: 'A descrição deve ter pelo menos 3 caracteres'
            }
          })}
        />
        {errors.descricao && <p className="error">{errors.descricao.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Transação'}
        </button>
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