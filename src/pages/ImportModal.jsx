import { useEffect, useMemo, useState } from 'react';
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
  const [categories, setCategories] = useState([]);

  const steps = ['Selecionar Arquivo', 'Revisar Dados', 'Conciliação', 'Selecionar Banco', 'Confirmar'];

  useEffect(() => {
    if (!open) return;

    const loadCategories = async () => {
      try {
        const cats = await window.api.listCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    loadCategories();
  }, [open]);

  const limparTexto = (texto) => {
    if (!texto) return '';
    return String(texto).toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const mapearColunas = (row) => {
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

  const parseCategoryId = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : '';
  };

  const isRowImportable = (row) => {
    return Boolean(
      row.amount &&
      row.transactionType &&
      row.occurredOn &&
      String(row.description || '').trim() &&
      parseCategoryId(row.categoryId)
    );
  };

  const pendingRows = useMemo(
    () => parsedData.filter((row) => !isRowImportable(row)),
    [parsedData]
  );

  const importableRowsCount = useMemo(
    () => parsedData.filter((row) => isRowImportable(row)).length,
    [parsedData]
  );

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

          const dadosMapeados = results.data
            .map(row => {
              const mapeado = mapearColunas(row);
              return {
                amount: mapeado.amount,
                description: (mapeado.description || '').trim(),
                transactionType: normalizarTipo(mapeado.transactionType),
                occurredOn: mapeado.occurredOn,
                categoryId: parseCategoryId(mapeado.categoryId)
              };
            })
            .filter(row => row.amount && row.transactionType && row.occurredOn);

          if (dadosMapeados.length === 0) {
            setMessage(
              '❌ Nenhuma linha válida encontrada.\n\n' +
              'O arquivo deve conter as colunas:\n' +
              '• Valor (amount, valor)\n' +
              '• Tipo (transactionType, tipo) - "receita" ou "despesa"\n' +
              '• Data (occurredOn, data) - formato YYYY-MM-DD\n\n' +
              'Descrição e categoria podem vir vazias para conciliação antes de importar.'
            );
            setMessageSeverity('error');
            return;
          }

          setParsedData(dadosMapeados);
          setMessage(
            `✅ ${dadosMapeados.length} transações encontradas no arquivo. ` +
            `${dadosMapeados.filter((row) => !isRowImportable(row)).length} pendentes de conciliação.`
          );
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
      const currentPending = pendingRows.length;
      const currentImportable = importableRowsCount;

      if (currentPending > 0) {
        setMessage(
          `⚠️ ${currentPending} transação(ões) pendentes de conciliação. ` +
          `${currentImportable} pronta(s) para importação.`
        );
        setMessageSeverity('warning');
      } else {
        setMessage(`✅ Todas as transações foram conciliadas. ${currentImportable} pronta(s) para importação.`);
        setMessageSeverity('success');
      }

      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleImport = async () => {
    const rowsToImport = parsedData
      .filter((row) => isRowImportable(row))
      .map((row) => ({
        ...row,
        description: String(row.description).trim(),
        categoryId: Number(row.categoryId)
      }));

    if (rowsToImport.length === 0) {
      setMessage('❌ Nenhuma transação conciliada para importar. Preencha descrição e categoria na etapa de conciliação.');
      setMessageSeverity('error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.importTransactions(
        userEmail,
        rowsToImport,
        selectedBankId || null
      );

      setImportResults(result.results);
      setMessage(result.message);
      setMessageSeverity(result.success ? 'success' : 'error');

      if (result.success) {
        const skipped = parsedData.length - rowsToImport.length;
        if (skipped > 0) {
          setMessage(
            `${result.message}\n⚠️ ${skipped} transação(ões) não foram importadas por falta de conciliação.`
          );
          setMessageSeverity('warning');
        }

        setTimeout(() => {
          onImportSuccess?.();
          handleClose();
        }, 1500);
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

  const handleConciliationFieldChange = (index, field, value) => {
    setParsedData((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (field === 'categoryId') {
          return { ...row, categoryId: parseCategoryId(value) };
        }
        return { ...row, [field]: value };
      })
    );
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
                      <TableCell>{row.description || '—'}</TableCell>
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

        {step === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              🧩 Conciliação de pendências
            </Typography>
            {pendingRows.length === 0 ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Todas as transações já estão conciliadas. Você ainda pode editar descrição e categoria antes de prosseguir.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {pendingRows.length} transação(ões) com descrição ou categoria faltando. Só as conciliadas serão importadas.
              </Alert>
            )}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Categoria</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.occurredOn}</TableCell>
                      <TableCell>{row.transactionType === 'receita' ? '📈 Receita' : '📉 Despesa'}</TableCell>
                      <TableCell align="right">{row.amount}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.description || ''}
                          onChange={(e) => handleConciliationFieldChange(idx, 'description', e.target.value)}
                          placeholder="Descrição obrigatória"
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <TextField
                          size="small"
                          select
                          fullWidth
                          value={row.categoryId || ''}
                          onChange={(e) => handleConciliationFieldChange(idx, 'categoryId', e.target.value)}
                        >
                          <MenuItem value="">Selecione uma categoria</MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {step === 3 && (
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

        {step === 4 && (
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
                  📊 <strong>Total no arquivo:</strong> {parsedData.length}
                </Typography>
                <Typography variant="body2">
                  ✅ <strong>Prontas para importar:</strong> {importableRowsCount}
                </Typography>
                <Typography variant="body2">
                  ⚠️ <strong>Não conciliadas (não serão importadas):</strong> {parsedData.length - importableRowsCount}
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
          {step === 4 && importResults ? 'Fechar' : 'Cancelar'}
        </Button>
        {step > 0 && step < 4 && (
          <Button onClick={handleBack}>Voltar</Button>
        )}
        {step < 4 && (
          <Button onClick={handleNext} variant="contained" disabled={step === 0 && !file}>
            Próximo
          </Button>
        )}
        {step === 4 && (
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={isLoading || importableRowsCount === 0}
          >
            {isLoading ? '⏳ Importando...' : '✓ Importar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}