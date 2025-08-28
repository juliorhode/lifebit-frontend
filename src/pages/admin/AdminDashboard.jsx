import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { SETUP_STATES } from '../../config/constants.js';
import SetupNotification from '../../components/ui/SetupNotification.jsx';

const AdminDashboard = () => {
    const usuario = useAuthStore((state) => state.usuario);
    const navigate = useNavigate();

    const showSetupNotification = usuario?.estado_configuracion !== SETUP_STATES.COMPLETADO;

    return (
        <div>
            {showSetupNotification && (
                <SetupNotification
                    estado={usuario.estado_configuracion}
                    onContinue={() => navigate('/dashboard/setup')}
                />
            )}

            <h1 className="text-3xl font-bold text-white">
                Dashboard Principal del Administrador
            </h1>
            <p className="text-gray-400 mt-2">
                Bienvenido, {usuario?.nombre}. Aquí verás un resumen de la actividad de tu edificio.
            </p>
            {/* Aquí irá el resto del contenido del dashboard... */}
        </div>
    );
};

export default AdminDashboard;