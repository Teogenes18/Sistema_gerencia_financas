import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance,
  AddCircleOutline,
  DeleteOutline,
  Logout
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      tipo: 'receita',
      valor: '',
      data: '',
      descricao: ''
    }
  });

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }), []);

  const balance = useMemo(() => {
    return transactions.reduce((total, tx) => {
      const amount = Number(tx.amount) || 0;
      const signal = tx.transactionType === 'receita' ? 1 : -1;
      return total + amount * signal;
    }, 0);
  }, [transactions]);

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await window.api.listTransactions(user.id);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  }, [user?.id]);

  const onSubmit = async (data) => {
    try {
      await window.api.addTransaction({
        transactionType: data.tipo,
        amount: parseFloat(data.valor),
        occurredOn: data.data,
        description: data.descricao.trim(),
        userEmail: user.id
      });

      reset();
      setIsModalOpen(false);
      loadTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm('Tem certeza que deseja excluir esta transação?');
    if (!confirmed) return;

    try {
      await window.api.deleteTransaction(id, user.id);
      loadTransactions();
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

  const openTransactionModal = () => setIsModalOpen(true);
  const closeTransactionModal = () => {
    setIsModalOpen(false);
    reset();
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const balanceColor = balance >= 0 ? 'success.main' : 'error.main';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={logo} alt="Gerenciador de Finanças" sx={{ width: 56, height: 56 }} />
            <Box>
              <Typography variant="h6">Gerenciador de Finanças</Typography>
              <Typography variant="body2" color="text.secondary">
                Bem-vindo, {user?.nome || 'usuário'}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<AccountBalance />}
          onClick={goToBank}
          sx={{ flexGrow: 1 }}
        >
          Cadastrar Banco
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddCircleOutline fontSize="large" />}
          size="large"
          sx={{
            flexGrow: { xs: 1, md: 1.4 },
            py: 1.5,
            fontSize: '1rem'
          }}
          onClick={openTransactionModal}
        >
          Adicionar Transação
        </Button>
        <Paper elevation={1} sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Saldo Atual
          </Typography>
          <Typography variant="h4" sx={{ color: balanceColor, fontWeight: 600 }}>
            {currencyFormatter.format(balance)}
          </Typography>
        </Paper>
      </Stack>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          minHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Extrato</Typography>
          <Chip label={`${transactions.length} item(s)`} color="primary" variant="outlined" />
        </Stack>

        {transactions.length === 0 ? (
          <Typography color="text.secondary">
            Nenhuma transação cadastrada.
          </Typography>
        ) : (
          <List sx={{ flexGrow: 1, overflowY: 'auto' }} disablePadding>
            {transactions.map((t, index) => {
              const amount = Number(t.amount) || 0;
              const formattedAmount = currencyFormatter.format(Math.abs(amount));
              const prefix = t.transactionType === 'receita' ? '+' : '-';
              const amountColor = t.transactionType === 'receita' ? 'success.main' : 'error.main';
              const [ano = '', mes = '', dia = ''] = (t.occurredOn || '').split('-');
              const description = t.description?.trim() || 'Sem descrição';

              return (
                <Box key={t.id || index}>
                  {index !== 0 && <Divider sx={{ my: 1 }} />}
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => handleDelete(t.id)}>
                        <DeleteOutline />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${dia}/${mes}/${ano} - ${description}`}
                      secondary={`Tipo: ${t.transactionType === 'receita' ? 'Receita' : 'Despesa'}`}
                    />
                    <Typography variant="subtitle1" sx={{ color: amountColor, fontWeight: 600, mr: 4 }}>
                      {`${prefix} ${formattedAmount}`}
                    </Typography>
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Soma</Typography>
          <Chip
            label={currencyFormatter.format(balance)}
            color={balance >= 0 ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      <Dialog open={isModalOpen} onClose={closeTransactionModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogContent dividers>
            <TextField
              select
              label="Tipo"
              fullWidth
              margin="normal"
              defaultValue="receita"
              {...register('tipo', {
                required: 'Selecione o tipo de transação'
              })}
              error={Boolean(errors.tipo)}
              helperText={errors.tipo?.message}
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </TextField>

            <TextField
              label="Valor"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ step: '0.01', min: '0.01' }}
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
              error={Boolean(errors.valor)}
              helperText={errors.valor?.message}
            />

            <TextField
              label="Data"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('data', {
                required: 'Por favor, selecione uma data'
              })}
              error={Boolean(errors.data)}
              helperText={errors.data?.message}
            />

            <TextField
              label="Descrição"
              fullWidth
              margin="normal"
              placeholder="Descrição da transação"
              {...register('descricao', {
                required: 'Por favor, preencha a descrição',
                minLength: {
                  value: 3,
                  message: 'A descrição deve ter pelo menos 3 caracteres'
                }
              })}
              error={Boolean(errors.descricao)}
              helperText={errors.descricao?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeTransactionModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Transação'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}