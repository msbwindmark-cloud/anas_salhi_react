import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* Lado Izquierdo: Logo/Nombre */}
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                    <LayoutDashboard size={28} />
                    <span className="text-gray-800 tracking-tight">Anas<span className="text-blue-600">App</span></span>
                </div>

                {/* Lado Derecho: Usuario y Logout */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                            <User size={18} />
                        </div>
                        <span className="font-medium hidden md:block">
                            {user.first_name || 'Utilisateur'}
                        </span>
                    </div>

                    <button 
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-semibold border border-red-100"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:block">Déconnexion</span>
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;