/**
 * @description Página principal y componente "orquestador" del módulo de residentes.
 * Este componente utiliza el hook `useGestionResidentes` para obtener toda la lógica y el estado.
 * Su principal responsabilidad es ensamblar los sub-componentes (estadísticas, paneles, listas, modales)
 * y pasarles los datos y funciones necesarios como props.
 *
 * @returns {JSX.Element} La página completa de gestión de residentes.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'; // Importación añadida para notificaciones
import Modal from '../../../components/ui/Modal';
import ListaResidentes from '../components/ListaResidentes';
import InvitarResidenteModal from '../components/InvitarResidenteModal';
import InvitarResidentesMasivoModal from '../components/InvitarResidentesMasivoModal';
import EstadisticasResidentes from '../components/EstadisticasResidentes';
import BorradoresPanel from '../components/BorradoresPanel';
import { useGestionResidentes } from '../hooks/useGestionResidentes';
import Spinner from '../../../components/ui/Spinner';
import { formatearTiempoRelativo } from '../utils/residentes.utils'; 

const ResidentesPage = () => {
    // Obtenemos toda la lógica y el estado centralizado desde nuestro hook maestro.
    const {
        residentesFiltrados,
        estadisticas,
        unidadesDisponibles,
        borradores,
        estadoCarga,
        hayDatosNuevos,
        searchTerm,
        setSearchTerm,
        filtroEstado,
        setFiltroEstado,
        isInvitarModalOpen,
        isMasivoModalOpen,
        isSuspenderModalOpen,
        residenteEditando,
        residenteASuspender,
        datosBorrador,
        handleOpenInvitarModal,
        handleCargarBorrador,
        setIsMasivoModalOpen,
        handleEditarResidente,
        handleSuspenderResidente,
        handleCloseModals,
        confirmarCambioEstado,
        idAccion,
        handleInvitacionExitosa,
        handleGuardarBorrador,
        handleEliminarBorrador,
        refrescarDatos,
        ultimaActualizacion,
        refrescarPasivamente,
    } = useGestionResidentes();

    // Nuevo estado para forzar la actualización del indicador de tiempo.
    const [tiempoActual, setTiempoActual] = useState(Date.now());

    // --- EFECTO PARA EL INDICADOR DE TIEMPO RELATIVO ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTiempoActual(Date.now());
        }, 60000); // Cada minuto
        return () => clearInterval(intervalId);
    }, []);

    // --- EFECTO PARA EL POLLING PASIVO DE DATOS ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible' && !isInvitarModalOpen) {
                refrescarPasivamente();
            }
        }, 10000); // Cada 10 segundos para pruebas. En produccion, colocar 5 minutos (300000 ms)
        return () => clearInterval(intervalId);
    }, [refrescarPasivamente, isInvitarModalOpen]);

    // Lógica para manejar el éxito de la carga masiva.
    const handleInvitacionesMasivasExitosas = () => {
        refrescarDatos();
        setIsMasivoModalOpen(false);
        toast.success('Proceso de carga masiva iniciado en segundo plano.');
    };
    
    // Si los datos esenciales aún se están cargando, mostramos un indicador general.
    if (estadoCarga === 'cargando') {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner type="ring1" />
                <p className="ml-4 text-lg">Cargando datos del edificio...</p>
            </div>
        );
    }

    // Si hubo un error al cargar los datos, mostramos un mensaje claro.
    if (estadoCarga === 'error') {
        return (
            <div className="text-center p-8 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-500/30">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-300">Error de Carga</h2>
                <p className="text-red-600 dark:text-red-400 mt-2">No se pudieron cargar los datos de los residentes. Por favor, intenta refrescar la página.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER: Título y acciones principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-700 dark:text-white">Gestión de Residentes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Administra, invita y actualiza a los residentes de tu edificio.
                        {/* 
                          INDICADOR DE TIEMPO:
                          - Se muestra solo si `ultimaActualizacion` existe.
                          - El `key={tiempoActual}` es una pequeña optimización que puede ayudar
                            a React a detectar que este span necesita re-renderizarse.
                        */}
                        {ultimaActualizacion && (
                            <span key={tiempoActual} className="ml-2 text-xs text-tertiary">
                                • Actualizado {formatearTiempoRelativo(ultimaActualizacion)}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleOpenInvitarModal}
                        className="btn-primary"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Invitar Residente
                    </button>
                    <button
                        onClick={() => setIsMasivoModalOpen(true)}
                        className="btn-secondary"
                    >
                        <i className="fas fa-file-excel mr-2"></i>
                        Invitación Masiva
                    </button>
                </div>
            </div>

            {/* --- BANNER DE NOTIFICACIÓN DE NUEVOS DATOS --- */}
            {hayDatosNuevos && (
                <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between gap-4 animate-pulse">
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        Se han detectado nuevas actualizaciones en la lista de residentes.
                    </p>
                    <button onClick={refrescarDatos} className="btn-primary px-4 py-1 text-sm whitespace-nowrap">
                        <i className="fas fa-sync-alt mr-2"></i>
                        Mostrar Cambios
                    </button>
                </div>
            )}

            {/* ESTADÍSTICAS: Panel con métricas generales */}
            <EstadisticasResidentes
                estadisticas={estadisticas}
            />

            {/* BORRADORES: Pasamos los borradores y las funciones para manipularlos. */}
            <BorradoresPanel
                borradores={borradores}
                onCargarBorrador={handleCargarBorrador}
                onEliminarBorrador={handleEliminarBorrador}
            />

            {/* LISTA DE RESIDENTES: Tabla con filtros y búsqueda */}
            <ListaResidentes
                residentes={residentesFiltrados}
                isLoading={estadoCarga === 'cargando'}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filtroEstado={filtroEstado}
                onFiltroChange={setFiltroEstado}
                onRefresh={refrescarDatos}
                onEditar={handleEditarResidente}
                onSuspender={handleSuspenderResidente}
                idAccion={idAccion}
            />

            {/* MODAL PARA INVITACIÓN INDIVIDUAL / EDICIÓN */}
            <Modal
                isOpen={isInvitarModalOpen}
                onClose={handleCloseModals}
                title={
                    residenteEditando ? "Editar Residente" :
                    datosBorrador ? "Continuar Borrador de Invitación" :
                    "Invitar Nuevo Residente"
                }
            >
                {/* 
                  CORRECCIÓN CRÍTICA: Aquí se establecen las conexiones que faltaban.
                  Ahora pasamos `unidadesDisponibles` y `handleGuardarBorrador` como props
                  al modal, completando el flujo de datos.
                */}
                <InvitarResidenteModal
                    onClose={handleCloseModals}
                    onSuccess={handleInvitacionExitosa}
                    onGuardarBorrador={handleGuardarBorrador}
                    initialData={datosBorrador}
                    residenteEditando={residenteEditando}
                    unidadesDisponibles={unidadesDisponibles}
                />
            </Modal>

            {/* MODAL PARA INVITACIÓN MASIVA */}
            <Modal
                isOpen={isMasivoModalOpen}
                onClose={() => setIsMasivoModalOpen(false)}
                title="Invitación Masiva de Residentes"
            >
                <InvitarResidentesMasivoModal
                    onClose={() => setIsMasivoModalOpen(false)}
                    onSuccess={handleInvitacionesMasivasExitosas}
                />
            </Modal>

            {/* MODAL DE CONFIRMACIÓN PARA SUSPENDER/REACTIVAR */}
            <Modal
                isOpen={isSuspenderModalOpen}
                onClose={handleCloseModals}
                title={residenteASuspender?.estado === 'suspendido' ? "Reactivar Residente" : "Suspender Residente"}
            >
                <div className="text-center">
                    <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                        ¿Estás seguro de que deseas {residenteASuspender?.estado === 'suspendido' ? 'reactivar' : 'suspender'} a 
                        <strong className="font-semibold text-gray-900 dark:text-white"> {residenteASuspender?.nombre} {residenteASuspender?.apellido}</strong>?
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={handleCloseModals} className="btn-secondary">Cancelar</button>
                        <button 
                            onClick={confirmarCambioEstado} 
                            className={`btn-primary ${residenteASuspender?.estado !== 'suspendido' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {idAccion === residenteASuspender?.id ? 'Procesando...' : (residenteASuspender?.estado === 'suspendido' ? 'Sí, reactivar' : 'Sí, suspender')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ResidentesPage;