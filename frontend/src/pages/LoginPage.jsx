import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail } from "lucide-react";
import Swal from "sweetalert2";
import { Link } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Alerta de "Cargando"
    Swal.fire({
      title: "Connexion en cours...",
      text: "Veuillez patienter",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await login(email, password);

      // 2. Alerta de Éxito
      Swal.fire({
        icon: "success",
        title: "Bienvenue!",
        text: "Connexion réussie avec succès",
        timer: 2000,
        showConfirmButton: false,
        padding: "2em",
        color: "#1e293b",
        background: "#fff",
      });
    } catch (error) {
      // 3. Alerta de Error
      Swal.fire({
        icon: "error",
        title: "Erreur de connexion",
        text: "E-mail ou mot de passe incorrect. Veuillez réessayer.",
        confirmButtonColor: "#3b82f6", // El azul de tu botón
        confirmButtonText: "Réessayer",
      });
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "300px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Connexion</h2>

        <div style={{ marginBottom: "15px" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Mail size={18} className="text-blue-600" /> Adresse e-mail
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 shadow-sm"
            placeholder="exemple@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Lock size={16} className="text-blue-600" /> Mot de passe
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 shadow-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
        <p className="text-center mt-6 text-sm text-gray-600">
    Pas encore de compte ? <Link to="/register" className="text-blue-600 font-bold hover:underline">Créez-en un ici</Link>
</p>
      </form>
    </div>
  );
};

export default LoginPage;
