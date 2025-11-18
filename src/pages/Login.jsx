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

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [apiMessage, setApiMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info');
  const { login, userExists } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiMessage('');
      const result = await login(data);
      setApiMessage(result.message);
      setMessageSeverity(result.success ? 'success' : 'error');
      
      if (result.success) {
        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMessageSeverity('error');
      setApiMessage('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acesse sua conta para acompanhar suas finanças.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              margin="normal"
              {...register('email', {
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
              {...register('senha', {
                required: 'Por favor, preencha a senha'
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
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          {apiMessage && (
            <Alert severity={messageSeverity} variant="outlined">
              {apiMessage}
            </Alert>
          )}

          {!userExists && (
            <Typography variant="body2" textAlign="center">
              Ainda não tem uma conta?{' '}
              <Link component={RouterLink} to="/register" underline="hover">
                Cadastre-se
              </Link>
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}