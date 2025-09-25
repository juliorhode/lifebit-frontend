import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { SETUP_STATES } from '../../../config/constants';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import Modal from '../../../components/ui/Modal';
import ListaResidentes from '../components/ListaResidentes';
import InvitarResidenteModal from '../components/InvitarResidenteModal';
import InvitarResidentesMasivoModal from '../components/InvitarResidentesMasivoModal';
import EstadisticasResidentes from '../components/EstadisticasResidentes';
import BorradoresPanel from '../components/BorradoresPanel';
import { useGestionResidentes } from '../hooks/useGestionResidentes';

/**
 * @description Página principal del módulo de residentes
 * Componente presentacional que delega toda la lógica al hook useGestionResidentes
 * Proporciona interfaz completa para gestión de residentes del edificio
 * @returns {JSX.Element} Componente de la página principal de residentes
 */
const ResidentesPage = () => {
    // STORE: Acceso al estado global de autenticación
    const { usuario, getProfile } = useAuthStore();

    // HOOK: Toda la lógica de gestión de residentes centralizada
    const {
        residentesFiltrados,
        estadisticas,
        isLoading,
        ultimaActualizacion,
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
        handleCargarBorrador, // ✅ NUEVO: Función del hook para cargar borradores
        setIsMasivoModalOpen,
        handleEditarResidente,
        handleSuspenderResidente,
        handleCloseModals,
        confirmarCambioEstado,
        eliminandoId,
        handleInvitacionExitosa,
        handleBorradorGuardado, // ✅ NUEVO: Función para refrescar panel de borradores
        cargarResidentes,
        borradoresRefreshTrigger, // ✅ NUEVO: Trigger para refrescar borradores
    } = useGestionResidentes();

    // STATE: Lógica específica de UI que no pertenece al hook
    const [tiempoIndicador, setTiempoIndicador] = useState(Date.now()); // Para forzar actualización del indicador

    // POLLING AUTOMÁTICO: Actualizar datos cada 10 minutos cuando la pestaña esté visible
    useEffect(() => {
        const interval = setInterval(() => {
            // Solo hacer polling si la pestaña está visible (ahorro de recursos)
            if (document.visibilityState === 'visible') {
                cargarResidentesSilenciosamente();
            }
        }, 600000); // 10 minutos

        return () => clearInterval(interval);
    }, []);

    // ACTUALIZACIÓN DEL INDICADOR: Forzar re-renderización cada 60 segundos para actualizar el tiempo relativo
    useEffect(() => {
        const interval = setInterval(() => {
            setTiempoIndicador(Date.now());
        }, 60000); // 60 segundos

        return () => clearInterval(interval);
    }, []);

    // SETUP WIZARD: Verificación adicional al cargar residentes
    useEffect(() => {
        // Si estamos en el paso 3 del setup wizard y ya hay residentes, completar automáticamente
        const isInSetupWizard = usuario?.estado_configuracion === SETUP_STATES.PASO_3_RESIDENTES;
        const hasResidentes = estadisticas.total > 0;

        if (isInSetupWizard && hasResidentes) {
            const completarSetupAutomaticamente = async () => {
                try {
                    await apiService.post('/admin/configuracion/avanzar-paso');
                    await getProfile(); // Refrescar perfil para actualizar estado_configuracion
                    toast.success('Setup completado automáticamente.');
                } catch (error) {
                    console.error('Error al completar setup wizard automáticamente:', error);
                }
            };
            completarSetupAutomaticamente();
        }
    }, [estadisticas.total, usuario?.estado_configuracion, getProfile]);

    /**
     * @description Carga silenciosamente los residentes para polling automático
     * Solo actualiza si hay cambios detectados y muestra notificación
     * @async
     */
    const cargarResidentesSilenciosamente = async () => {
        try {
            const response = await apiService.get('/admin/residentes');
            const nuevosDatos = response.data.data || [];

            // Verificar si hay cambios en la cantidad de residentes o en los datos
            const hayCambios = estadisticas.total !== nuevosDatos.length ||
                              JSON.stringify(estadisticas) !== JSON.stringify({
                                  total: nuevosDatos.length,
                                  activos: nuevosDatos.filter(r => r.estado === 'activo').length,
                                  pendientes: nuevosDatos.length - nuevosDatos.filter(r => r.estado === 'activo').length
                              });

            if (hayCambios) {
                // Recargar usando el hook
                cargarResidentes();

                // Mostrar notificación de actualización (solo si hay cambios)
                const residentesInactivos = nuevosDatos.length - nuevosDatos.filter(r => r.estado === 'activo').length;
                if (residentesInactivos > 0) {
                    toast.info(`Datos actualizados - ${residentesInactivos} residente${residentesInactivos > 1 ? 's' : ''} pendiente${residentesInactivos > 1 ? 's' : ''} de activación`, {
                        duration: 3000 // 3 segundos
                    });
                }
            }
        } catch (error) {
            console.error('Error en polling silencioso:', error);
            // No mostrar error al usuario para polling silencioso
        }
    };

    /**
     * @description Formatea el tiempo transcurrido desde la última actualización
     * @param {Date} fecha - Fecha de la última actualización
     * @returns {string} Tiempo relativo formateado
     */
    const formatearTiempoRelativo = (fecha) => {
        if (!fecha) return '';

        const ahora = new Date();
        const diferencia = ahora - fecha;
        const segundos = Math.floor(diferencia / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);

        if (segundos < 60) return 'hace unos segundos';
        if (minutos < 60) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
        if (horas < 24) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;

        return fecha.toLocaleString();
    };

    // ✅ REMOVIDO: La función handleCargarBorrador ahora viene del hook useGestionResidentes
    // Esto asegura que los datos del borrador se manejen correctamente

    /**
     * @description Maneja el éxito de invitaciones masivas
     * Recarga la lista y muestra mensaje con estadísticas
     * @param {Object} resultados - Resultados del proceso masivo {exitosos, errores}
     */
    const handleInvitacionesMasivasExitosas = (resultados) => {
        cargarResidentes();
        setIsMasivoModalOpen(false);

        const exitosas = resultados.exitosos || 0;
        const fallidas = resultados.errores?.length || 0;

        if (fallidas === 0) {
            toast.success(`¡${exitosas} invitaciones enviadas exitosamente!`);
        } else {
            toast.success(`${exitosas} invitaciones enviadas, ${fallidas} con errores`);
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER: Título y acciones principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Residentes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Administra las invitaciones de los residentes de tu edificio.
                        {ultimaActualizacion && tiempoIndicador && (
                            <span className="ml-2 text-xs text-gray-900 dark:text-white">
                                • Datos actualizados {formatearTiempoRelativo(ultimaActualizacion)}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleOpenInvitarModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Invitar Residente
                    </button>
                    <button
                        onClick={() => setIsMasivoModalOpen(true)}
                        className="bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                        <i className="fas fa-file-excel mr-2"></i>
                        Invitar Masivo
                    </button>

                </div>
            </div>

            {/* ESTADÍSTICAS: Panel con métricas generales */}
            <EstadisticasResidentes
                residentes={residentesFiltrados}
                isLoading={isLoading}
            />

            {/* BORRADORES: Panel de invitaciones pendientes (si existen) */}
            <BorradoresPanel
                onCargarBorrador={handleCargarBorrador}
                refreshTrigger={borradoresRefreshTrigger} // ✅ NUEVO: Trigger para refrescar
            />

            {/* LISTA DE RESIDENTES: Tabla con filtros y búsqueda */}
            <ListaResidentes
                residentes={residentesFiltrados}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filtroEstado={filtroEstado}
                onFiltroChange={setFiltroEstado}
                onRefresh={cargarResidentes}
                onEditar={handleEditarResidente}
                onSuspender={handleSuspenderResidente}
                eliminandoId={eliminandoId}
            />

            {/* MODALES: Formularios de invitación */}
            <Modal
                isOpen={isInvitarModalOpen}
                onClose={handleCloseModals}
                title={
                    residenteEditando ? "Editar Residente" :
                    datosBorrador ? "Continuar Invitación" :
                    "Invitar Nuevo Residente"
                }
            >
                <InvitarResidenteModal
                    onClose={handleCloseModals}
                    onSuccess={() => {
                        handleInvitacionExitosa();
                        handleBorradorGuardado();
                    }}
                    onBorradorGuardado={handleBorradorGuardado} // ✅ NUEVO: Para refrescar panel
                    initialData={datosBorrador}
                    residenteEditando={residenteEditando}
                />
            </Modal>

            <Modal
                isOpen={isMasivoModalOpen}
                onClose={() => setIsMasivoModalOpen(false)}
                title="Gestión Masiva de Residentes"
            >
                <InvitarResidentesMasivoModal
                    onClose={() => setIsMasivoModalOpen(false)}
                    onSuccess={handleInvitacionesMasivasExitosas}
                />
            </Modal>

            {/* MODAL DE GESTIÓN DE ESTADO */}
            <Modal
                isOpen={isSuspenderModalOpen}
                onClose={handleCloseModals}
                title={residenteASuspender?.estado === 'suspendido' ? "Reactivar Residente" : "Suspender Residente"}
            >
                <div className="space-y-4">
                    <div className="text-center">
                        {/* <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                             style={{ backgroundColor: residenteASuspender?.estado === 'suspendido' ? '#10b981' : '#f97316' }}>
                            <i className={`fas ${residenteASuspender?.estado === 'suspendido' ? 'fa-user-check' : 'fa-exclamation-triangle'} text-white text-lg`}></i>
                        </div> */}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {residenteASuspender?.estado === 'suspendido'
                                ? "¿Estás seguro de reactivar a este residente?"
                                : "¿Estás seguro de suspender a este residente?"
                            }
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {residenteASuspender?.estado === 'suspendido'
                                ? `El residente ${residenteASuspender?.nombre} ${residenteASuspender?.apellido} recuperará acceso a la plataforma.`
                                : `El residente ${residenteASuspender?.nombre} ${residenteASuspender?.apellido} perderá acceso temporalmente a la plataforma.`
                            }
                        </p>
                        <div className={`bg-opacity-50 border rounded-lg p-3 mb-4`}
                             style={{
                                 backgroundColor: residenteASuspender?.estado === 'suspendido' ? '#065f46' : '#9a3412',
                                 borderColor: residenteASuspender?.estado === 'suspendido' ? '#10b981' : '#f97316'
                             }}>
                            <p className={`text-sm`}
                                style={{ color: residenteASuspender?.estado === 'suspendido' ? '#34d399' : '#fdba74' }}>
                                <i className="fas fa-info-circle mr-2"></i>
                                {residenteASuspender?.estado === 'suspendido'
                                    ? "El residente podrá acceder nuevamente a todas las funciones de la plataforma."
                                    : "Esta acción puede ser revertida activando el residente posteriormente."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={handleCloseModals}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmarCambioEstado}
                            disabled={eliminandoId === residenteASuspender?.id}
                            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2`}
                            style={{
                                backgroundColor: residenteASuspender?.estado === 'suspendido' ? '#10b981' : '#f97316'
                            }}
                        >
                            {eliminandoId === residenteASuspender?.id ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {residenteASuspender?.estado === 'suspendido' ? 'Reactivando...' : 'Suspendiendo...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${residenteASuspender?.estado === 'suspendido' ? 'fa-user-check' : 'fa-user-times'}`}></i>
                                    {residenteASuspender?.estado === 'suspendido' ? 'Reactivar' : 'Suspender'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ResidentesPage;