import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { SETUP_STATES } from '../../config/constants.js';
import SetupNotification from '../../components/ui/SetupNotification.jsx';
import IndicadorProgresoResidentes from '../../components/ui/IndicadorProgresoResidentes.jsx';
import { STYLES } from '../../utils/styleConstants.jsx';

/**
 * @description Dashboard principal del administrador
 * Maneja la lógica del wizard de configuración y asegura que el perfil esté completamente cargado
 * antes de mostrar el contenido del dashboard
 */
const AdminDashboard = () => {
    // === ESTADO DE AUTENTICACIÓN ===
    const usuario = useAuthStore((state) => state.usuario);           // Datos del usuario logueado
    const estado = useAuthStore((state) => state.estado);             // Estado del proceso de login ('loading', 'loggedIn', etc.)
    const getProfile = useAuthStore((state) => state.getProfile);     // Función para recargar el perfil del usuario
    const navigate = useNavigate();

    // === EFECTO PARA ASEGURAR CARGA COMPLETA DEL PERFIL ===
    // Problema anterior: El usuario llegaba al dashboard antes de que getProfile() terminara
    // de cargar datos adicionales como estado_configuracion, requiriendo F5 manual
    useEffect(() => {
        // Condición: Estamos logueados, tenemos usuario, pero falta estado_configuracion
        if (estado === 'loggedIn' && usuario && !usuario.estado_configuracion) {
            // Solución: Recargar automáticamente el perfil para obtener datos completos
            console.log('Perfil incompleto detectado, recargando...');
            getProfile();
        }
    }, [estado, usuario, getProfile]); // Se ejecuta cuando cambian estos valores

    // === VERIFICACIÓN DE CARGA COMPLETA ===
    // Mostrar loading mientras el perfil no esté completamente cargado
    // Esto previene que el usuario vea el dashboard sin el wizard de configuración
    if (estado === 'loading' || !usuario || !usuario.estado_configuracion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    {/* Spinner de carga para feedback visual */}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    // === LÓGICA DEL WIZARD DE CONFIGURACIÓN ===
    // Mostrar notificación del setup solo si la configuración no está completa
    const showSetupNotification = usuario?.estado_configuracion !== SETUP_STATES.COMPLETADO;

    return (
        <div>
            {showSetupNotification && (
                <SetupNotification
                    estado={usuario.estado_configuracion}
                    onContinue={() => navigate('/dashboard/setup')}
                />
            )}

            {/* INDICADOR DE PROGRESO DE RESIDENTES: Aparece cuando setup completo pero faltan residentes */}
            <IndicadorProgresoResidentes />

            <h1 className={STYLES.titlePage}>
                Dashboard Principal del Administrador
            </h1>
            <p className={STYLES.subTitlePage}>
                Bienvenido, {usuario?.nombre}. Aquí verás un resumen de la actividad de tu edificio.
            </p>
            {/* Aquí irá el resto del contenido del dashboard... */}
        </div>
    );
};

export default AdminDashboard;