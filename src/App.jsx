import { useState } from 'react';
import Register from './register';
import Login from './login';
import Home from './home';
import Bank from './Bank';
import './style.css';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

 if (user) {
    if (view === 'bank') {
      return (
        <Bank
          onBackToHome={() => setView('home')}
        />
      );
    }
    return (
      <Home 
        user={user} 
        onLogout={() => {
          setUser(null);
          setView('login');
        }}
        onGoToBank={() => {
          console.log('Indo para tela de banco'); 
          setView('bank');
        }}
      />
    );
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
