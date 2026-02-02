import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  FileDownload
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
];

const parseDateToLocal = (dateStr) => {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Charts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [startDateWarning, setStartDateWarning] = useState('');

  function getFirstDayOfMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const data = await window.api.listTransactions(user.id);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar transações', err);
    }

    try {
      const cats = await window.api.listCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Erro ao carregar categorias', err);
    }
  };

  const pieChartData = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.occurredOn);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return txDate >= start && txDate <= end && t.transactionType === 'despesa' && t.status === 1;
    });

    const byCategory = {};
    filtered.forEach((t) => {
      const catName = t.category?.name || 'Sem categoria';
      if (!byCategory[catName]) {
        byCategory[catName] = 0;
      }
      byCategory[catName] += Number(t.amount) || 0;
    });

    return Object.entries(byCategory).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  }, [transactions, startDate, endDate]);

  const totalExpenses = useMemo(() => {
    return pieChartData.reduce((sum, item) => sum + item.value, 0);
  }, [pieChartData]);

  const barChartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.occurredOn);
      return txDate >= start && txDate <= end && t.status === 1;
    });

    const grouped = {};
    filtered.forEach(t => {
      const date = t.occurredOn;
      if (!grouped[date]) {
        grouped[date] = { date, receita: 0, despesa: 0 };
      }
      if (t.transactionType === 'receita') {
        grouped[date].receita += Number(t.amount);
      } else {
        grouped[date].despesa += Number(t.amount);
      }
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        receita: parseFloat(item.receita.toFixed(2)),
        despesa: parseFloat(item.despesa.toFixed(2))
      }));
  }, [transactions, startDate, endDate]);

  const lineChartData = useMemo(() => {
    const start = parseDateToLocal(startDate);
    const end = parseDateToLocal(endDate);
    if (!start || !end || start > end) return [];

    const validTx = transactions
      .filter((t) => t.status === 1 && t.occurredOn)
      .map((t) => ({ ...t, txDate: parseDateToLocal(t.occurredOn) }))
      .filter((t) => t.txDate && t.txDate <= end)
      .sort((a, b) => a.txDate - b.txDate);

    // valores acumulados antes do período
    let cumulReceita = validTx
      .filter((t) => t.txDate < start && t.transactionType === 'receita')
      .reduce((s, t) => s + Number(t.amount), 0);
    let cumulDespesa = validTx
      .filter((t) => t.txDate < start && t.transactionType === 'despesa')
      .reduce((s, t) => s + Number(t.amount), 0);

    const data = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const dayStr = formatDate(day);

      const daily = validTx.filter(
        (t) => formatDate(t.txDate) === dayStr
      );

      const dailyReceita = daily
        .filter((t) => t.transactionType === 'receita')
        .reduce((s, t) => s + Number(t.amount), 0);
      const dailyDespesa = daily
        .filter((t) => t.transactionType === 'despesa')
        .reduce((s, t) => s + Number(t.amount), 0);

      cumulReceita += dailyReceita;
      cumulDespesa += dailyDespesa;

      data.push({
        date: dayStr,
        receita: parseFloat(cumulReceita.toFixed(2)),
        despesa: parseFloat(cumulDespesa.toFixed(2))
      });
    }

    return data;
  }, [transactions, startDate, endDate]);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const exportPDF = async () => {
    const element = document.getElementById('chart-container');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    const today = new Date().toLocaleDateString('pt-BR');
    const periodStart = new Date(startDate).toLocaleDateString('pt-BR');
    const periodEnd = new Date(endDate).toLocaleDateString('pt-BR');
    pdf.setFontSize(10);
    pdf.text(`Período analisado: ${periodStart} a ${periodEnd}`, 10, imgHeight + 20);
    pdf.text(`Relatório gerado em: ${today}`, 10, imgHeight + 26);
    
    pdf.save(`relatorio-graficos-${startDate}-${endDate}.pdf`);
  };

  function getMinStartDate() {
    const today = new Date();
    // Subtrai 12 meses
    const d = new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());
    return formatDate(d);
  }

  const handleStartDateChange = (value) => {
    if (!value) {
      setStartDate(value);
      setStartDateWarning('');
      return;
    }
    const min = getMinStartDate();
    if (value < min) {
      setStartDate(min);
      setStartDateWarning(`A data inicial não pode ser anterior a 12 meses a partir de hoje. Ajustada para ${min}.`);
      // limpa a mensagem após alguns segundos
      setTimeout(() => setStartDateWarning(''), 4000);
    } else {
      setStartDate(value);
      setStartDateWarning('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Painel de Gráficos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize a evolução das suas finanças
          </Typography>
        </Box>
        <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate('/home')}>
          Voltar
        </Button>
      </Stack>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <TextField
            select
            label="Tipo de Gráfico"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            margin="normal"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="bar">Gráfico de Barras</MenuItem>
            <MenuItem value="line">Gráfico de Linha</MenuItem>
            <MenuItem value="pie">Gráfico de Pizza</MenuItem>
          </TextField>

          {(() => {
            const minStart = getMinStartDate();
            return (
              <TextField
                label="Data Inicial"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minStart }}
              />
            );
          })()}
           <TextField
             label="Data Final"
             type="date"
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
             InputLabelProps={{ shrink: true }}
           />
          {startDateWarning && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {startDateWarning}
            </Alert>
          )}
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={exportPDF}
            disabled={pieChartData.length === 0 && barChartData.length === 0}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }} id="chart-container">

        {chartType === 'bar' && (
          <Box mb={6}>
            <Typography variant="h6" mb={2}>Comparativo Diário: Receitas vs Despesas</Typography>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barGap={8} 
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      const [y, m, d] = val.split('-');
                      return `${d}/${m}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => currencyFormatter.format(value)}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="receita" fill="#2e7d32" name="Receitas" barSize={20} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="#d32f2f" name="Despesas" barSize={20} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" textAlign="center">Sem dados para exibir o gráfico de evolução neste período.</Typography>
            )}
          </Box>
        )}

        {chartType === 'line' && (
          <Box mb={6}>
            <Typography variant="h6" mb={2}>Receitas vs Despesas (Acumulado)</Typography>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => {
                      const [y, m, d] = val.split('-');
                      return `${d}/${m}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#2e7d32" name="Receitas" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="despesa" stroke="#d32f2f" name="Despesas" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" textAlign="center">Sem dados para exibir o gráfico de evolução neste período.</Typography>
            )}
          </Box>
        )}

        {chartType === 'pie' && (
          <Box>
            <Typography variant="h6" mb={2}>Gastos por Categoria (Total: {currencyFormatter.format(totalExpenses)})</Typography>
            {pieChartData.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
                <Box sx={{ flex: 1, width: '100%', maxWidth: 600, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ flex: 1, px: 2, minWidth: 220 }}>
                  <Stack spacing={1}>
                    {pieChartData.map((item, index) => (
                      <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Box sx={{ width: 16, height: 16, backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }} />
                          <Typography sx={{ maxWidth: 260, wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            {item.name} ({((item.value / totalExpenses) * 100).toFixed(0)}%)
                          </Typography>
                        </Box>
                        <Typography sx={{ ml: 1 }}>{currencyFormatter.format(item.value)}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center">Nenhuma despesa encontrada no período selecionado.</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}