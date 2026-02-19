import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import Papa from 'papaparse';

export default function ImportModal({ open, onClose, banks, userEmail, onImportSuccess }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const steps = ['Selecionar Arquivo', 'Revisar Dados', 'Selecionar Banco', 'Confirmar'];

  const limparTexto = (texto) => {
    if (!texto) return '';
    return String(texto).toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const mapearColunas = (row) => {
    // Procurar pelas colunas em português ou inglês
    const findColumn = (aliases) => {
      return Object.keys(row).find(col => 
        aliases.includes(limparTexto(col))
      );
    };

    const colAmount = findColumn(['amount', 'valor', 'value']);
    const colDescription = findColumn(['description', 'descricao', 'descri', 'desc']);
    const colType = findColumn(['transactiontype', 'tipo', 'type', 'tipotransa']);
    const colDate = findColumn(['occurredon', 'data', 'date', 'dataocorrencia']);
    const colCategory = findColumn(['categoryid', 'categoria', 'category']);

    return {
      amount: row[colAmount] || '',
      description: row[colDescription] || '',
      transactionType: row[colType] || '',
      occurredOn: row[colDate] || '',
      categoryId: row[colCategory] || ''
    };
  };

  const normalizarTipo = (tipo) => {
    const t = limparTexto(tipo);
    if (['receita', 'income', 'entrada', 'renda', 'ganho'].includes(t)) return 'receita';
    if (['despesa', 'expense', 'saida', 'gasto', 'custo'].includes(t)) return 'despesa';
    return t;
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setMessage('❌ Por favor, selecione um arquivo CSV válido.');
      setMessageSeverity('error');
      return;
    }

    setFile(selectedFile);
    setMessage('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            setMessage('❌ Arquivo vazio.');
            setMessageSeverity('error');
            return;
          }

          // Mapear colunas automaticamente
          const dadosMapeados = results.data
            .map(row => {
              const mapeado = mapearColunas(row);
              return {
                amount: mapeado.amount,
                description: mapeado.description,
                transactionType: normalizarTipo(mapeado.transactionType),
                occurredOn: mapeado.occurredOn,
                categoryId: mapeado.categoryId
              };
            })
            .filter(row => row.amount && row.description && row.transactionType && row.occurredOn);

          if (dadosMapeados.length === 0) {
            setMessage(
              '❌ Nenhuma linha válida encontrada.\n\n' +
              'O arquivo deve conter as colunas:\n' +
              '• Valor (amount, valor)\n' +
              '• Descrição (description, descricao)\n' +
              '• Tipo (transactionType, tipo) - "receita" ou "despesa"\n' +
              '• Data (occurredOn, data) - formato YYYY-MM-DD'
            );
            setMessageSeverity('error');
            return;
          }

          setParsedData(dadosMapeados);
          setMessage(`✅ ${dadosMapeados.length} transações encontradas no arquivo.`);
          setMessageSeverity('success');
          setStep(1);
        } catch (error) {
          setMessage('❌ Erro ao validar arquivo: ' + error.message);
          setMessageSeverity('error');
        }
      },
      error: (error) => {
        setMessage('❌ Erro ao ler arquivo: ' + error.message);
        setMessageSeverity('error');
      }
    });
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.importTransactions(
        userEmail,
        parsedData,
        selectedBankId || null
      );

      setImportResults(result.results);
      setMessage(result.message);
      setMessageSeverity(result.success ? 'success' : 'error');

      if (result.success) {
        setTimeout(() => {
          onImportSuccess?.();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setMessage('❌ Erro ao importar: ' + error.message);
      setMessageSeverity('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setFile(null);
    setSelectedBankId('');
    setParsedData([]);
    setMessage('');
    setImportResults(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>📥 Importar Transações</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 400 }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {message && (
          <Alert severity={messageSeverity} sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {message}
          </Alert>
        )}

        {/* PASSO 0: Selecionar Arquivo */}
        {step === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📄 Selecione um arquivo CSV
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              O arquivo deve ter as colunas em português ou inglês.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="caption" component="div" sx={{ mb: 1, fontFamily: 'monospace' }}>
                <strong>Exemplo de arquivo:</strong>
              </Typography>
              <code style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`valor,descrição,tipo,data
1500.00,Salário,receita,2024-01-15
50.00,Supermercado,despesa,2024-01-16
200.00,Aluguel,despesa,2024-01-20`}
              </code>
            </Paper>

            <Button
              variant="contained"
              component="label"
              startIcon={<FileUpload />}
              size="large"
            >
              Escolher Arquivo CSV
              <input
                hidden
                accept=".csv"
                type="file"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
        )}

        {/* PASSO 1: Revisar Dados */}
        {step === 1 && parsedData.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              ✓ Primeiras transações encontradas:
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.occurredOn}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>
                        <strong style={{ color: row.transactionType === 'receita' ? '#2e7d32' : '#d32f2f' }}>
                          {row.transactionType === 'receita' ? '📈 Receita' : '📉 Despesa'}
                        </strong>
                      </TableCell>
                      <TableCell align="right">{row.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* PASSO 2: Selecionar Banco */}
        {step === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              🏦 Selecione um banco para vincular as transações:
            </Typography>
            <TextField
              select
              fullWidth
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              label="Banco"
              margin="normal"
            >
              <MenuItem value="">Nenhum - Não vincular a banco</MenuItem>
              {banks?.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info" sx={{ mt: 2 }}>
              Se nenhum banco for selecionado, as transações serão importadas sem vínculo a uma conta.
            </Alert>
          </Box>
        )}

        {/* PASSO 3: Confirmar */}
        {step === 3 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              ✓ Resumo da importação:
            </Typography>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  📄 <strong>Arquivo:</strong> {file?.name}
                </Typography>
                <Typography variant="body2">
                  📊 <strong>Transações:</strong> {parsedData.length}
                </Typography>
                <Typography variant="body2">
                  🏦 <strong>Banco:</strong> {selectedBankId ? banks?.find(b => b.id === parseInt(selectedBankId))?.name : 'Nenhum'}
                </Typography>
              </Paper>
              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Importando transações...</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {step === 3 && importResults ? 'Fechar' : 'Cancelar'}
        </Button>
        {step > 0 && step < 3 && (
          <Button onClick={handleBack}>Voltar</Button>
        )}
        {step < 3 && (
          <Button onClick={handleNext} variant="contained" disabled={step === 0 && !file}>
            Próximo
          </Button>
        )}
        {step === 3 && (
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? '⏳ Importando...' : '✓ Importar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}