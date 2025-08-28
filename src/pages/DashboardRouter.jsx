import React from 'react';
import { useAuthStore } from '../store/authStore.js';
import AdminDashboard from './admin/AdminDashboard.jsx';

// Placeholders para los otros dashboards
const OwnerDashboard = () => <div className="text-white">Dashboard del Dueño</div>;
const ResidenteDashboard = () => <div className="text-white">Dashboard del Residente</div>;

const DashboardRouter = () => {
    const rol = useAuthStore((state) => state.usuario?.rol);

    if (!rol) return null; // O un loader

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