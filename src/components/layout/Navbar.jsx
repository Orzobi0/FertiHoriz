
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { LogOut, BarChart3, CalendarDays, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null; // Don't show navbar on auth page
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg p-4 sticky top-0 z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight flex items-center">
          <CalendarDays className="mr-2 h-7 w-7" />
          FertiliApp
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="hover:bg-white/20">
            <BarChart3 className="mr-2 h-5 w-5" />
            Ciclo Actual
          </Button>
          <Button variant="ghost" onClick={() => navigate('/cycles-history')} className="hover:bg-white/20">
            <CalendarDays className="mr-2 h-5 w-5" />
            Mis Ciclos
          </Button>
          <div className="flex items-center space-x-2 text-sm">
            <UserCircle className="h-5 w-5" />
            <span>{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
  