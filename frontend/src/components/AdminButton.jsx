import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings } from 'lucide-react';

const AdminButton = () => {
    const { user } = useContext(AuthContext);

    // Solo se muestra si el usuario existe y tiene is_superuser en true
    if (!user || !user.is_superuser) return null;

    return (
        <a 
            href="http://127.0.0.1:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-2xl transition-all flex items-center gap-2 group z-50"
            title="Accéder au Panel Admin"
        >
            <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
                Panel Admin Django
            </span>
        </a>
    );
};

export default AdminButton;