import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerForm, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [apiMessage, setApiMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      const result = await registerUser(data);
      setApiMessage(result.message);
      setMessageSeverity(result.success ? 'success' : 'error');
      
      if (result.success) {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setMessageSeverity('error');
      setApiMessage('Erro ao tentar cadastrar. Tente novamente.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Cadastro de Usuário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie sua conta para começar a organizar suas finanças.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              {...registerForm('nome', {
                required: 'Por favor, preencha o nome',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
              error={Boolean(errors.nome)}
              helperText={errors.nome?.message}
            />

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              margin="normal"
              {...registerForm('email', {
                required: 'Por favor, preencha o e-mail',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'E-mail inválido'
                }
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              margin="normal"
              placeholder="Mínimo 8 caracteres, com letras e números"
              {...registerForm('senha', {
                required: 'Por favor, preencha a senha',
                minLength: {
                  value: 8,
                  message: 'A senha deve ter no mínimo 8 caracteres'
                },
                validate: {
                  hasLetter: (value) =>
                    /[A-Za-z]/.test(value) || 'A senha deve conter letras',
                  hasNumber: (value) =>
                    /[0-9]/.test(value) || 'A senha deve conter números'
                }
              })}
              error={Boolean(errors.senha)}
              helperText={errors.senha?.message}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </Box>

          {apiMessage && (
            <Alert severity={messageSeverity} variant="outlined">
              {apiMessage}
            </Alert>
          )}

          <Typography variant="body2" textAlign="center">
            Já possui uma conta?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Faça login
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}