import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance,
  AddCircleOutline,
  DeleteOutline,
  Logout,
  FilterList,
  CheckCircle,
  AccessTime,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  FileDownload
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
  Typography,
  Switch
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';
import jsPDF from 'jspdf';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState(null);
  const [filterBankId, setFilterBankId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const [pdfStartDate, setPdfStartDate] = useState(getFirstDayOfMonth());
  const [pdfEndDate, setPdfEndDate] = useState(getTodayDate());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      tipo: 'receita',
      valor: '',
      data: getTodayDate(),
      descricao: '',
      categoryId: '',
      bankId: '',
      status: 1
    }
  });

  const { control: editControl, register: editRegister, handleSubmit: editHandleSubmit, formState: { errors: editErrors, isSubmitting: editIsSubmitting }, reset: editReset } = useForm();

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }), []);

  const balance = useMemo(() => {
    let transactionBalance = transactions.reduce((total, tx) => {
      if (typeof tx.status !== 'undefined' && Number(tx.status) !== 1) return total;
      if (tx.bank && !tx.bank.isActive) return total;

      const amount = Number(tx.amount) || 0;
      const signal = tx.transactionType === 'receita' ? 1 : -1;
      return total + amount * signal;
    }, 0);

    let bankBalance = banks.reduce((total, bank) => {
      if (!bank.isActive) return total;
      return total + (Number(bank.balance) || 0);
    }, 0);

    return transactionBalance + bankBalance;
  }, [transactions, banks]);

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

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await window.api.listCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.error('Erro ao carregar categorias', e);
        setCategories([]);
      }
    }
    loadCategories();
    async function loadBanks() {
      try {
        if (window.api.listBanks) {
          const bs = await window.api.listBanks();
          setBanks(Array.isArray(bs) ? bs : []);
        } else {
          setBanks([]);
        }
      } catch (e) {
        console.error('Erro ao carregar bancos', e);
        setBanks([]);
      }
    }
    loadBanks();
  }, []);

  const onSubmit = async (data) => {
    try {
      await window.api.addTransaction({
        transactionType: data.tipo,
        amount: parseFloat(data.valor),
        occurredOn: data.data,
        description: data.descricao.trim(),
        categoryId: parseInt(data.categoryId, 10) || null,
        bankId: data.bankId ? parseInt(data.bankId, 10) : null,
        status: parseInt(data.status, 10),
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
    const confirmed = window.confirm('Tem certeza que deseja excluir esta transação?');
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
    reset({
      tipo: 'receita',
      valor: '',
      data: getTodayDate(),
      descricao: '',
      categoryId: '',
      bankId: '',
      status: 1
    });
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    editReset({
      descricao: transaction.description,
      valor: transaction.amount,
      data: transaction.occurredOn,
      categoryId: transaction.categoryId,
      bankId: transaction.bankId
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
    editReset();
  };

  const onEditSubmit = async (data) => {
    try {
      await window.api.updateTransaction(editingTransaction.id, user.id, {
        description: data.descricao.trim(),
        amount: parseFloat(data.valor),
        occurredOn: data.data,
        categoryId: parseInt(data.categoryId, 10),
        bankId: data.bankId ? parseInt(data.bankId, 10) : null
      });

      closeEditModal();
      loadTransactions();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      alert('Erro ao atualizar transação. Tente novamente.');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const balanceColor = balance >= 0 ? 'success.main' : 'error.main';

  const handleSelectCategory = (value) => {
    if (value === null) {
      setFilterCategoryId(null);
    } else {
      setFilterCategoryId(Number(value));
    }
  };
  const handleSelectBank = (value) => {
    if (value === null) {
      setFilterBankId(null);
    } else {
      setFilterBankId(Number(value));
    }
  };

const displayedTransactions = transactions.filter((t) => {
    if (filterBankId != null) {
      const bId = t.bankId ?? (t.bank && t.bank.id);
      if (Number(bId) !== Number(filterBankId)) return false;
    }
    if (filterCategoryId != null) {
      if (!t.category || Number(t.category.id) !== Number(filterCategoryId)) return false;
    }
    
    if (filterStatus !== 'all') {
      if (Number(t.status) !== Number(filterStatus)) return false;
    }

    return true;
  });

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await window.api.updateTransactionStatus(id, user.id, newStatus);
      loadTransactions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Valor', 'Descrição', 'Categoria', 'Banco', 'Status'];
    const rows = displayedTransactions.map(t => {
      const data = t.occurredOn.split('-').reverse().join('/');
      const tipo = t.transactionType === 'receita' ? 'Receita' : 'Despesa';
      const valor = t.amount;
      const descricao = t.description || '';
      const categoria = t.category?.name || '';
      const banco = t.bank?.name || '';
      const status = t.status === 1 ? 'Efetuada' : 'Pendente';
      return [data, tipo, valor, descricao, categoria, banco, status];
    });
    const csvContent = [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transacoes.csv';
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const exportToPDF = () => {
  };

  const handleExportPdf = () => {
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.occurredOn);
      const start = pdfStartDate ? new Date(pdfStartDate) : null;
      const end = pdfEndDate ? new Date(pdfEndDate) : null;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    }).sort((a, b) => new Date(a.occurredOn) - new Date(b.occurredOn));

    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Relatório de Transações', 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Período: ${pdfStartDate || 'Todos'} a ${pdfEndDate}`, 20, 35);
    pdf.text(`Total de transações: ${filteredTransactions.length}`, 20, 45);

    let y = 60;
    let balance = 0;

    filteredTransactions.forEach(t => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      const amount = Number(t.amount) || 0;
      const signal = t.transactionType === 'receita' ? 1 : -1;
      balance += amount * signal;

      const type = t.transactionType === 'receita' ? 'Receita' : 'Despesa';
      const category = t.category ? t.category.name : 'Sem categoria';
      const bank = t.bank ? t.bank.name : 'Sem banco';

      pdf.setFontSize(10);
      pdf.text(`Data: ${t.occurredOn}`, 20, y);
      pdf.text(`Descrição: ${t.description}`, 20, y + 5);
      pdf.text(`Tipo: ${type}`, 20, y + 10);
      pdf.text(`Valor: ${currencyFormatter.format(amount)}`, 20, y + 15);
      pdf.text(`Categoria: ${category}`, 20, y + 20);
      pdf.text(`Banco: ${bank}`, 20, y + 25);
      pdf.text(`Saldo acumulado: ${currencyFormatter.format(balance)}`, 20, y + 30);

      y += 40;
    });

    pdf.setFontSize(14);
    pdf.text(`Saldo final no período: ${currencyFormatter.format(balance)}`, 20, y + 10);

    pdf.save(`transacoes-${pdfStartDate || 'inicio'}-${pdfEndDate}.pdf`);
    setIsExportModalOpen(false);
  };

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
        <Button
          variant="contained"
          startIcon={<AccountBalance />}
          onClick={goToBank}
          sx={{ flexGrow: 1 }}
        >
          Meus Bancos
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<BarChartIcon />}
          onClick={() => navigate('/charts')}
          sx={{ flexGrow: 1 }}
        >
          Gráficos
        </Button>
        <Paper elevation={1} sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Saldo Total
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
          flexDirection: 'column'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Extrato</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`${transactions.length} item(s)`} color="primary" variant="outlined" />
            <Button
              variant={filterBankId || filterCategoryId ? 'contained' : 'outlined'}
              startIcon={<FilterList />}
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => setIsExportModalOpen(true)}
            >
              Exportar
            </Button>
            {filterBankId != null && (
              <Chip
                label={(() => {
                  const b = banks.find(x => Number(x.id) === Number(filterBankId));
                  return b ? b.name : `Banco #${filterBankId}`;
                })()}
                onDelete={() => setFilterBankId(null)}
                color="info"
              />
            )}
            {filterCategoryId != null && (
              <Chip
                label={(() => {
                  const c = categories.find(x => Number(x.id) === Number(filterCategoryId));
                  return c ? c.name : `Categoria #${filterCategoryId}`;
                })()}
                onDelete={() => setFilterCategoryId(null)}
                color="info"
              />
            )}
          </Stack>
        </Stack>

        <Dialog open={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Filtrar Transações</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Status</Typography>
            <TextField
              select
              fullWidth
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              margin="normal"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="1">Efetuadas</MenuItem>
              <MenuItem value="0">Pendentes</MenuItem>
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Banco</Typography>
            <TextField
              select
              fullWidth
              value={filterBankId || ''}
              onChange={(e) => handleSelectBank(e.target.value || null)}
              margin="normal"
            >
              <MenuItem value="">Todos</MenuItem>
              {banks && banks.length > 0 ? (
                banks.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhum banco</MenuItem>
              )}
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Categoria</Typography>
            <TextField
              select
              fullWidth
              value={filterCategoryId || ''}
              onChange={(e) => handleSelectCategory(e.target.value || null)}
              margin="normal"
            >
              <MenuItem value="">Todas</MenuItem>
              {categories && categories.length > 0 ? (
                categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhuma categoria</MenuItem>
              )}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              handleSelectBank(null);
              setFilterCategoryId(null);
              setFilterStatus('all');
              setIsFilterModalOpen(false);
            }} color="inherit">
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsFilterModalOpen(false)} variant="contained">
              Aplicar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Exportar Transações</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Formato</Typography>
            <TextField
              select
              fullWidth
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              margin="normal"
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </TextField>
            {exportFormat === 'pdf' && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Período</Typography>
                <TextField
                  label="Data de Início"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={pdfStartDate}
                  onChange={(e) => setPdfStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Data de Fim"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={pdfEndDate}
                  onChange={(e) => setPdfEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsExportModalOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button onClick={exportFormat === 'csv' ? exportToCSV : handleExportPdf} variant="contained">
              Exportar
            </Button>
          </DialogActions>
        </Dialog>

        {displayedTransactions.length === 0 ? (
          (filterBankId != null && filterCategoryId == null) ? (
            <Typography color="error.main" sx={{ mt: 2 }}>
              Nenhuma transação salva com esse banco.
            </Typography>
          ) : (filterCategoryId != null && filterBankId == null) ? (
            <Typography color="error.main" sx={{ mt: 2 }}>
              Nenhuma transação salva com essa categoria.
            </Typography>
          ) : (filterCategoryId != null && filterBankId != null) ? (
            <Typography color="error.main" sx={{ mt: 2 }}>
              Nenhuma transação salva com esse filtro.
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Nenhuma transação cadastrada.
            </Typography>
          )
        ) : (
          <List sx={{
            overflowY: 'auto',
            overflowX: 'hidden'
          }} disablePadding>
            {displayedTransactions.map((t, index) => {
              const amount = Number(t.amount) || 0;
              const formattedAmount = currencyFormatter.format(Math.abs(amount));
              const prefix = t.transactionType === 'receita' ? '+' : '-';
              const amountColor = t.transactionType === 'receita' ? 'success.main' : 'error.main';
              const [ano = '', mes = '', dia = ''] = (t.occurredOn || '').split('-');
              const description = t.description?.trim() || 'Sem descrição';
              const categoryName = t.category?.name || 'Sem categoria';

              return (
                <Box key={t.id || index}>
                  {index !== 0 && <Divider sx={{ my: 1 }} />}
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <IconButton 
                          edge="end" 
                          color="primary" 
                          onClick={() => openEditModal(t)}
                          title="Editar transação"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Switch
                          edge="end"
                          checked={t.status === 1}
                          onChange={() => handleToggleStatus(t.id, t.status)}
                          color="primary"
                          title={t.status === 1 ? "Marcar como pendente" : "Marcar como efetuada"}
                        />
                        <IconButton 
                          edge="end" 
                          color="error" 
                          onClick={() => handleDelete(t.id)}
                          size="small"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >

                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }} title={t.status === 1 ? "Efetuada" : "Pendente"}>
                      {t.status === 1 ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <AccessTime color="action" fontSize="small" />
                      )}
                    </Box>

                    <ListItemText
                      primary={`${dia}/${mes}/${ano} - ${description}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                            Tipo: {t.transactionType === 'receita' ? 'Receita' : 'Despesa'}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                            Categoria: {categoryName}
                          </Typography>
                        </>
                      }
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

      <TextField
              select
              label="Status"
              fullWidth
              margin="normal"
              defaultValue={1}
              {...register('status', { required: true })}
            >
              <MenuItem value={1}>Efetuada</MenuItem>
              <MenuItem value={0}>Pendente</MenuItem>
            </TextField>

            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Selecione a categoria da transação' }}
              defaultValue={''}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Categoria"
                  fullWidth
                  margin="normal"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {categories && categories.length > 0 ? (
                    categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))
                  ) : (
                    <>
                      <MenuItem value={1}>Salário</MenuItem>
                      <MenuItem value={2}>Conta</MenuItem>
                      <MenuItem value={3}>Alimentação</MenuItem>
                      <MenuItem value={4}>Saúde</MenuItem>
                      <MenuItem value={5}>Transporte</MenuItem>
                      <MenuItem value={6}>Lazer</MenuItem>
                    </>
                  )}
                </TextField>
              )}
            />

            <Controller
              name="bankId"
              control={control}
              defaultValue={''}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Banco"
                  fullWidth
                  margin="normal"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {banks && banks.length > 0 ? (
                    banks
                    .filter(b => b.isActive)
                    .map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Nenhum Banco cadastrado</MenuItem>
                  )}
                </TextField>
              )}
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

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={editHandleSubmit(onEditSubmit)}>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Descrição"
              fullWidth
              margin="normal"
              placeholder="Descrição da transação"
              {...editRegister('descricao', {
                required: 'Por favor, preencha a descrição',
                minLength: {
                  value: 3,
                  message: 'A descrição deve ter pelo menos 3 caracteres'
                }
              })}
              error={Boolean(editErrors.descricao)}
              helperText={editErrors.descricao?.message}
            />

            <TextField
              label="Valor"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ step: '0.01', min: '0.01' }}
              {...editRegister('valor', {
                required: 'Por favor, preencha o valor',
                min: {
                  value: 0.01,
                  message: 'O valor deve ser maior que zero'
                }
              })}
              error={Boolean(editErrors.valor)}
              helperText={editErrors.valor?.message}
            />

            <TextField
              label="Data"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...editRegister('data', {
                required: 'Por favor, selecione uma data'
              })}
              error={Boolean(editErrors.data)}
              helperText={editErrors.data?.message}
            />

            <Controller
              name="categoryId"
              control={editControl}
              rules={{ required: 'Selecione a categoria' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Categoria"
                  fullWidth
                  margin="normal"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {categories && categories.length > 0 ? (
                    categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Nenhuma categoria</MenuItem>
                  )}
                </TextField>
              )}
            />

            <Controller
              name="bankId"
              control={editControl}
              defaultValue={''}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Banco"
                  fullWidth
                  margin="normal"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {banks && banks.length > 0 ? (
                    banks
                    .filter(b => b.isActive)
                    .map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Nenhum Banco cadastrado</MenuItem>
                  )}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={editIsSubmitting}>
              {editIsSubmitting ? 'Atualizando...' : 'Atualizar Transação'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}