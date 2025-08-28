import React from 'react';
import { useAuthStore } from '../../../store/authStore.js';
import { SETUP_STATES } from '../../../config/constants.js';
import UnidadesPage from './UnidadesPage.jsx';

// Creamos placeholders para los pasos futuros
const RecursosPage = () => <div className="text-white">Página de Configuración de Recursos (Paso 2)</div>;
const ResidentesPage = () => <div className="text-white">Página de Configuración de Residentes (Paso 3)</div>;

/**
 * @description Componente de página que actúa como un "orquestador".
 * Renderiza el paso correcto del asistente de configuración
 * basándose en el estado del edificio del administrador.
 */
const SetupWizard = () => {
    const usuario = useAuthStore((state) => state.usuario);

    // Mientras la información del usuario carga, mostramos un loader.
    if (!usuario || !usuario.estado_configuracion) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-white">Cargando información de configuración...</p>
            </div>
        );
    }

    // Usamos un switch para una lógica de renderizado limpia y escalable.
    switch (usuario.estado_configuracion) {
        case SETUP_STATES.PASO_1_UNIDADES:
            return <UnidadesPage />;

        case SETUP_STATES.PASO_2_RECURSOS:
            return <RecursosPage />;

        case SETUP_STATES.PASO_3_RESIDENTES:
            return <ResidentesPage />;

        // Si el estado es 'COMPLETADO' o desconocido, no debería llegar aquí
        // gracias a nuestro enrutador, pero añadimos un fallback por seguridad.
        default:
            return (
                <div className="text-white">
                    Estado de configuración desconocido o ya completado: {usuario.estado_configuracion}
                </div>
            );
    }
};

export default SetupWizard;