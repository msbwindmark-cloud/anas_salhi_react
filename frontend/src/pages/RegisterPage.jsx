import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Création du compte...', didOpen: () => Swal.showLoading() });

        try {
            await api.post('auth/register/', formData);
            Swal.fire({
                icon: 'success',
                title: 'Compte créé !',
                text: 'Vous pouvez maintenant vous connecter.',
                confirmButtonColor: '#3b82f6'
            });
            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Vérifiez vos données ou si l\'e-mail existe déjà.',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Inscription</h2>
                    <p className="text-gray-500 mt-2">Créez votre profil professionnel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><User size={14}/> Prénom</label>
                            <input name="first_name" onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                            <input name="last_name" onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><Mail size={14}/> E-mail</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><Phone size={14}/> Téléphone</label>
                        <input name="phone" onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+33..." required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><Lock size={14}/> Mot de passe</label>
                        <input name="password" type="password" onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-4">
                        S'inscrire
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Déjà inscrit ? <Link to="/login" className="text-blue-600 font-bold hover:underline">Connectez-vous ici</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;