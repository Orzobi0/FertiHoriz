
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('fertilityAppUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('fertilityAppUsers')) || [];
    const foundUser = users.find(u => u.email === email && u.password === password); // Plain text password check for now
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('fertilityAppUser', JSON.stringify(foundUser));
      toast({ title: "Inicio de sesión exitoso", description: "Bienvenida de nuevo." });
      navigate('/');
      return true;
    }
    toast({ variant: "destructive", title: "Error de inicio de sesión", description: "Email o contraseña incorrectos." });
    return false;
  };

  const register = (email, password) => {
    let users = JSON.parse(localStorage.getItem('fertilityAppUsers')) || [];
    if (users.find(u => u.email === email)) {
      toast({ variant: "destructive", title: "Error de registro", description: "Este email ya está registrado." });
      return false;
    }
    const newUser = { id: Date.now().toString(), email, password }; // Plain text password storage for now
    users.push(newUser);
    localStorage.setItem('fertilityAppUsers', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('fertilityAppUser', JSON.stringify(newUser));
    toast({ title: "Registro exitoso", description: "Tu cuenta ha sido creada." });
    navigate('/');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fertilityAppUser');
    toast({ title: "Sesión cerrada" });
    navigate('/auth');
  };

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
  