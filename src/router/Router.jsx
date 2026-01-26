import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Bank from '../pages/Bank';
import Charts from '../pages/Charts';
import { AuthProvider, useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/home" replace />;
}

function RegistrationRoute({ children }) {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
 
  
  return children;
}

export default function Router() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <RegistrationRoute>
                <Register />
              </RegistrationRoute>
            } 
          />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/bank" 
            element={
              <ProtectedRoute>
                <Bank />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/charts" 
            element={
              <ProtectedRoute>
                <Charts />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}