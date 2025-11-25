import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { ArrowBack, Savings, Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Bank() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('success');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([loadBanks(), loadTransactions()]);
  };

  const loadBanks = async () => {
    try {
      const result = await window.api.listBanks();
      setBanks(result || []);
    } catch (error) {
      console.error("Erro ao carregar bancos", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await window.api.listTransactions(user.id);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar transações", error);
    }
  };

  const getBankCurrentBalance = (bank) => {
    const initialBalance = Number(bank.balance) || 0;
    
    const bankTransactions = transactions.filter(
      t => t.bankId === bank.id && Number(t.status) === 1
    );

    const totalTransactions = bankTransactions.reduce((acc, t) => {
      const amount = Number(t.amount) || 0;
      return t.transactionType === 'receita' ? acc + amount : acc - amount;
    }, 0);

    return initialBalance + totalTransactions;
  };

  const handleToggleStatus = async (id) => {
    try {
      const result = await window.api.setBankStatus(id);
      if (result.success) {
        setApiMessage(result.message);
        setMessageSeverity('success');
        await loadBanks();
        setTimeout(() => setApiMessage(''), 2000);
      } else {
        setApiMessage(result.message || 'Erro ao alterar status');
        setMessageSeverity('error');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setApiMessage('Erro ao alterar status do banco');
      setMessageSeverity('error');
    }
  };

  const handleOpenModal = () => {
    setApiMessage('');
    reset();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      const result = await window.api.addBank({
        nome: data.nome.trim(),
        saldo: parseFloat(data.saldo)
      });

      if (result.success) {
        setApiMessage('Banco cadastrado com sucesso!');
        setMessageSeverity('success');
        reset();
        loadBanks();
        setTimeout(() => {
          setIsModalOpen(false);
          setApiMessage('');
        }, 1500);
      } else {
        setApiMessage(result.message || 'Não foi possível cadastrar o banco.');
        setMessageSeverity('error');
      }
    } catch (error) {
      console.error(error);
      setMessageSeverity('error');
      setApiMessage('Erro ao cadastrar banco.');
    }
  };

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Savings color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight={600}>
              Meus Bancos
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus bancos e acompanhe os saldos atualizados.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenModal}
          size="large"
        >
          Novo Banco
        </Button>
      </Stack>

      <Paper elevation={2}>
        <List disablePadding>
          {banks.map((bank, index) => {
            const currentBalance = getBankCurrentBalance(bank);
            const isPositive = currentBalance >= 0;

            return (
              <div key={bank.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{ py: 2 }}
                  secondaryAction={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {bank.isActive ? 'Ativa' : 'Inativa'}
                      </Typography>
                      <Switch
                        edge="end"
                        onChange={() => handleToggleStatus(bank.id)}
                        checked={Boolean(bank.isActive)}
                        color="success"
                      />
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ opacity: bank.isActive ? 1 : 0.5 }}>
                        {bank.name}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="column" spacing={0.5} mt={0.5} sx={{ opacity: bank.isActive ? 1 : 0.5 }}>
                        <Typography variant="body2" component="span">
                          Saldo Inicial: {currencyFormatter.format(bank.balance)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight="bold">
                            Saldo Atual:
                          </Typography>
                          <Chip 
                            label={currencyFormatter.format(currentBalance)} 
                            color={isPositive ? "success" : "error"} 
                            size="small" 
                            variant={bank.isActive ? "filled" : "outlined"}
                          />
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              </div>
            );
          })}
          {banks.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                Nenhum banco encontrado. Clique em "Novo Banco" para começar.
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      <Box mt={3}>
        <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate('/home')}>
          Voltar para o Dashboard
        </Button>
      </Box>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Cadastrar Novo Banco</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            {apiMessage && (
              <Alert severity={messageSeverity} sx={{ mb: 2 }}>
                {apiMessage}
              </Alert>
            )}
            
            <TextField
              label="Nome do Banco"
              placeholder="Ex: Nubank, Itaú, Carteira..."
              fullWidth
              margin="normal"
              {...register('nome', { 
                required: 'O nome é obrigatório', 
                minLength: { value: 2, message: 'Mínimo 2 caracteres' } 
              })}
              error={Boolean(errors.nome)}
              helperText={errors.nome?.message}
            />
            <TextField
              label="Saldo Inicial"
              type="number"
              fullWidth
              margin="normal"
              placeholder="0.00"
              inputProps={{ step: '0.01' }}
              {...register('saldo', { required: 'Saldo obrigatório' })}
              error={Boolean(errors.saldo)}
              helperText={errors.saldo?.message}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Conta'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}