// Ruta: src/modules/solicitudes/pages/SolicitudesPage.jsx
// VERSIÓN FINAL - ORQUESTADOR LIMPIO

/**
 * @file SolicitudesPage.jsx
 * @description Página "Orquestadora" del módulo de solicitudes.
 * Su única responsabilidad es llamar al hook `useGestionSolicitudes` (el "Maestro")
 * y pasar el estado y las funciones al componente `ListaSolicitudes` (el "Presentador").
 * @returns {JSX.Element}
 */
import React from 'react';
import { FiRefreshCw, FiInbox } from 'react-icons/fi';
import { useGestionSolicitudes } from '../hooks/useGestionSolicitudes';
import ListaSolicitudes from '../components/ListaSolicitudes'; // Importamos nuestro nuevo componente presentacional.
import Spinner from '../../../components/ui/Spinner';

const SolicitudesPage = () => {
    // --- LÓGICA Y ESTADO ---
    // El orquestador llama al hook maestro para obtener toda la lógica y el estado.
    const {
        solicitudes,
        isLoading,
        error,
        filtros,
        licencias,
        setFiltros,
        refrescarSolicitudes,
        hayDatosNuevos
    } = useGestionSolicitudes();

    // --- RENDERIZADO DE LA PÁGINA ---
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-primary">Gestión de Solicitudes de Servicio</h1>
                <p className="mt-2 text-lg text-secondary">
                    Revisa, aprueba o rechaza las nuevas solicitudes de clientes.
                </p>
            </header>

            {/* Banner de Notificación de Nuevos Datos */}
            {hayDatosNuevos && (
                <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between gap-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        Hay nuevas solicitudes o actualizaciones disponibles.
                    </p>
                    <button onClick={refrescarSolicitudes} className="btn-primary px-4 py-1 text-sm whitespace-nowrap">
                        <FiRefreshCw className="inline mr-2" />
                        Mostrar Cambios
                    </button>
                </div>
            )}

            {/* 
        ENSEÑANZA (Flujo de Datos Unidireccional):
        Este es el núcleo del patrón. La página orquestadora pasa los datos y las funciones
        hacia abajo, como props, al componente presentador.
        - `solicitudes` y `isLoading`: Datos para mostrar.
        - `filtros`: El estado actual de los filtros.
        - `onFiltroChange`: La *función* para cambiar los filtros (es `setFiltros`).
        - `onRefresh`: La *función* para recargar los datos.
        `ListaSolicitudes` no sabe *cómo* se cambian los filtros, solo sabe que debe
        llamar a `onFiltroChange` cuando el usuario interactúa.
      */}
            <main>
                {error ? (
                    <div className="text-center py-12 card-theme bg-red-500/10 border border-red-500/30">
                        <h3 className="text-lg font-medium text-red-400">Error al Cargar Solicitudes</h3>
                        <p className="mt-1 text-red-300">{error}</p>
                        <button onClick={refrescarSolicitudes} className="btn-primary mt-4">Reintentar</button>
                    </div>
                ) : (
                    <ListaSolicitudes
                        solicitudes={solicitudes}
                        isLoading={isLoading}
                        filtros={filtros}
                        licencias={licencias}
                        onFiltroChange={setFiltros}
                        onRefresh={refrescarSolicitudes}
                    />
                )}
            </main>

            {/* Placeholder para los Controles de Paginación */}
            <footer className="pt-4">
                {/* Aquí construiremos el componente de paginación en el siguiente paso. */}
            </footer>
        </div>
    );
};

export default SolicitudesPage;