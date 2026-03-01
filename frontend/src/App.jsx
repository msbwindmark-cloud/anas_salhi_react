import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from 'react'; // <--- Importante
import { AuthContext, AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard"; // <--- Importamos el nuevo Dashboard
import AdminButton from "./components/AdminButton";
import Navbar from "./components/Navbar";

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Chargement...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Solo mostramos la Navbar si el usuario está logueado */}
      {user && <Navbar />}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard PROTEGIDO */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>

      <AdminButton />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;