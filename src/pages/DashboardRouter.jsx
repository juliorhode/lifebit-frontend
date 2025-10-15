import React from 'react';
import { useAuthStore } from '../store/authStore.js';
import AdminDashboard from './admin/AdminDashboard.jsx';
import OwnerDashboard from './dueno/OwnerDashboard.jsx';

// Placeholder para el dashboard del residente
const ResidenteDashboard = () => <div className="text-3xl font-bold text-gray-700 dark:text-white">Dashboard del Residente</div>;

const DashboardRouter = () => {
    const rol = useAuthStore((state) => state.usuario?.rol);

    if (!rol) return null; // O un loader

    // Renderizamos el dashboard según el rol del usuario
    switch (rol) {
        case 'administrador':
            return <AdminDashboard />;
        case 'dueño_app':
            return <OwnerDashboard />;
        case 'residente':
            return <ResidenteDashboard />;
        default:
            return <div>Rol no reconocido</div>;
    }
};

export default DashboardRouter;