import { useState } from 'react';
import Register from './register';
import Login from './login';
import Home from './home';
import './style.css';

export default function App() {
  const [view, setView] = useState('login'); // 'login' ou 'register'
  const [user, setUser] = useState(null);

  if (user) {
    return <Home user={user} onLogout={() => setUser(null)} />;
  }

  if (view === 'register') {
    return (
      <Register
        onRegistered={(goToLogin = true) => goToLogin && setView('login')}
        onGoToLogin={() => setView('login')}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={(id, nome) => setUser({ id, nome })}
      onGoToRegister={() => setView('register')}
    />
  );
}
