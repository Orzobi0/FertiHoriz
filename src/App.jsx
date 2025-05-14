
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import AuthPage from '@/pages/AuthPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import CyclesHistoryPage from '@/pages/CyclesHistoryPage.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Navbar from '@/components/layout/Navbar.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';
import { MotionConfig } from "framer-motion"


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-primary text-xl">Cargando aplicación...</div>
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-lg mx-auto px-2 sm:px-4">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cycles-history" element={<CyclesHistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
      </main>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MotionConfig transition={{ duration: 0.3, type: "tween", ease: "circOut" }}>
          <div className="flex flex-col min-h-screen">
            <AppContent />
          </div>
        </MotionConfig>
      </AuthProvider>
    </Router>
  );
}

export default App;
  