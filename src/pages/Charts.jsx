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
  Divider
} from '@mui/material';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
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
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDate());

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

  // Dados para o Gráfico de Pizza (Despesas por Categoria)
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

  // Dados para o Gráfico de Barras (Evolução Receita x Despesa)
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
      .map((t) => ({
        ...t,
        txDate: parseDateToLocal(t.occurredOn)
      }))
      .filter((t) => t.txDate && t.txDate <= end)
      .sort((a, b) => a.txDate - b.txDate);

    const initialBalance = validTx
      .filter((t) => t.txDate < start)
      .reduce((acc, t) => acc + (t.transactionType === 'receita' ? Number(t.amount) : -Number(t.amount)), 0);

    const changeByDate = {};
    validTx.forEach((t) => {
      if (t.txDate < start) return;
      const key = formatDate(t.txDate);
      changeByDate[key] = (changeByDate[key] || 0) + (t.transactionType === 'receita' ? Number(t.amount) : -Number(t.amount));
    });

    const data = [];
    let running = initialBalance;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = formatDate(d);
      running += changeByDate[key] || 0;
      data.push({ date: key, saldo: parseFloat(running.toFixed(2)) });
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
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
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
        
        {/* Gráfico de Barras: Evolução */}
        <Box mb={6}>
          <Typography variant="h6" mb={2}>
            Comparativo Diário: Receitas vs Despesas
          </Typography>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={barChartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                // Adicionamos barGap para controlar o espaço entre as barras do mesmo grupo (opcional)
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
                <Bar 
                  dataKey="receita" 
                  fill="#2e7d32" 
                  name="Receitas" 
                  barSize={20} // Largura fixa da barra (mais fina)
                  radius={[4, 4, 0, 0]} // Cantos arredondados no topo
                />
                <Bar 
                  dataKey="despesa" 
                  fill="#d32f2f" 
                  name="Despesas" 
                  barSize={20} // Largura fixa da barra (mais fina)
                  radius={[4, 4, 0, 0]} // Cantos arredondados no topo
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Sem dados para exibir o gráfico de evolução neste período.
            </Typography>
          )}
        </Box>

        <Box mb={6}>
          <Typography variant="h6" mb={2}>
            Saldo Diário Acumulado
          </Typography>
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
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => currencyFormatter.format(value)} />
                <Tooltip formatter={(value) => currencyFormatter.format(value)} cursor={{ stroke: '#1565c0' }} />
                <Legend iconType="plainline" />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="#1565c0"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Sem movimentações para calcular o saldo neste período.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Gráfico de Pizza: Categorias */}
        <Box>
          <Typography variant="h6" mb={2}>
            Gastos por Categoria (Total: {currencyFormatter.format(totalExpenses)})
          </Typography>
          {pieChartData.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
              <Box sx={{ flex: 1, width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${((value / totalExpenses) * 100).toFixed(0)}%)`}
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

              <Box sx={{ flex: 1, px: 2 }}>
                <Stack spacing={1}>
                  {pieChartData.map((item, index) => (
                    <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }} />
                        <Typography>{item.name}</Typography>
                      </Box>
                      <Typography fontWeight={600}>
                        {currencyFormatter.format(item.value)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Nenhuma despesa encontrada no período selecionado.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}