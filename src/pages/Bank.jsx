import { useState } from 'react';
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
  Typography
} from '@mui/material';
import { ArrowBack, Savings } from '@mui/icons-material';

export default function Bank() {
  const navigate = useNavigate();
  const [apiMessage, setApiMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('success');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

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

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setApiMessage(result.message || 'Não foi possível cadastrar o banco.');
        setMessageSeverity('error');
      }
    } catch (error) {
      console.error(error);
      setMessageSeverity('error');
      setApiMessage('Erro ao cadastrar banco. Tente novamente.');
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Savings color="primary" />
              <Typography variant="h5" fontWeight={600}>
                Gerenciador Financeiro
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Cadastre um novo banco para acompanhar seus saldos iniciais.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Nome do Banco"
              placeholder="Ex: Banco do Brasil, Nubank, Caixa..."
              fullWidth
              margin="normal"
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
              error={Boolean(errors.nome)}
              helperText={errors.nome?.message}
            />

            <TextField
              label="Saldo Inicial"
              type="number"
              fullWidth
              margin="normal"
              placeholder="Ex: 1500.00"
              inputProps={{ step: '0.01', min: '0' }}
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
              error={Boolean(errors.saldo)}
              helperText={errors.saldo?.message}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Banco'}
            </Button>
          </Box>

          {apiMessage && (
            <Alert severity={messageSeverity} variant="outlined">
              {apiMessage}
            </Alert>
          )}

          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={goBack}
          >
            Voltar para o dashboard
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
