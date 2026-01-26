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
  Typography
} from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
];

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

  const chartData = useMemo(() => {
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
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

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
    pdf.text(`Gastos por Categoria - ${startDate} a ${endDate}`, 10, imgHeight + 30);
    pdf.text(`Total de Despesas: ${currencyFormatter.format(totalExpenses)}`, 10, imgHeight + 40);
    
    pdf.save(`relatorio-gastos-${startDate}-${endDate}.pdf`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Gastos por Categoria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e exporte relatórios de despesas
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
            disabled={chartData.length === 0}
          >
            Exportar PDF
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }} id="chart-container">
        {chartData.length > 0 ? (
          <Box>
            <Typography variant="h6" mb={2}>
              Total de Despesas: {currencyFormatter.format(totalExpenses)}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${currencyFormatter.format(value)}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Detalhamento por Categoria
              </Typography>
              <Stack spacing={1}>
                {chartData.map((item, index) => (
                  <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: COLORS[index % COLORS.length], borderRadius: '2px' }} />
                      <Typography>{item.name}</Typography>
                    </Box>
                    <Typography fontWeight={600}>
                      {currencyFormatter.format(item.value)}
                      {` (${((item.value / totalExpenses) * 100).toFixed(1)}%)`}
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
      </Paper>
    </Container>
  );
}