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

/**
 * @description Página principal del módulo de residentes
 * Proporciona interfaz completa para gestión de residentes del edificio
 * Incluye invitaciones, listado, estadísticas y sistema de borradores
 * @returns {JSX.Element} Componente de la página principal de residentes
 */
const ResidentesPage = () => {
    // STORE: Acceso al estado global de autenticación
    const { usuario, getProfile } = useAuthStore();

    // STATE: Gestión del estado local del componente
    const [residentes, setResidentes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInvitarModalOpen, setIsInvitarModalOpen] = useState(false);
    const [isMasivoModalOpen, setIsMasivoModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [datosBorrador, setDatosBorrador] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [tiempoIndicador, setTiempoIndicador] = useState(Date.now()); // Para forzar actualización del indicador
    const [residenteEditando, setResidenteEditando] = useState(null);
    const [isSuspenderModalOpen, setIsSuspenderModalOpen] = useState(false);
    const [residenteASuspender, setResidenteASuspender] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);

    // CARGA INICIAL: Obtener lista de residentes al montar componente
    useEffect(() => {
        cargarResidentes();
    }, []);

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
        const hasResidentes = residentes.length > 0;

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
    }, [residentes.length, usuario?.estado_configuracion, getProfile]);

    /**
     * @description Carga la lista completa de residentes desde la API
     * @async
     */
    const cargarResidentes = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get('/admin/residentes');
            setResidentes(response.data.data || []);
            setUltimaActualizacion(new Date());
        } catch (error) {
            console.error('Error al cargar residentes:', error);
            toast.error('Error al cargar la lista de residentes');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @description Carga silenciosamente los residentes para polling automático
     * Solo actualiza si hay cambios detectados y muestra notificación
     * @async
     */
    const cargarResidentesSilenciosamente = async () => {
        try {
            const response = await apiService.get('/admin/residentes');
            const nuevosDatos = response.data.data || [];

            // Detectar cambios en el estado de los residentes
            const cambiosDetectados = detectarCambiosEstado(residentes, nuevosDatos);

            // Verificar si hay cambios en la cantidad de residentes o en los datos
            const hayCambios = cambiosDetectados.length > 0 ||
                              residentes.length !== nuevosDatos.length ||
                              JSON.stringify(residentes) !== JSON.stringify(nuevosDatos);

            if (hayCambios) {
                setResidentes(nuevosDatos);
                setUltimaActualizacion(new Date());

                // Mostrar notificación de actualización (solo si hay cambios)
                mostrarNotificacionActualizacion();

                // Notificaciones específicas de cambios deshabilitadas para evitar spam
            }
        } catch (error) {
            console.error('Error en polling silencioso:', error);
            // No mostrar error al usuario para polling silencioso
        }
    };

    /**
     * @description Detecta cambios en el estado de activación de residentes
     * @param {Array} datosActuales - Lista actual de residentes (con campo 'estado')
     * @param {Array} datosNuevos - Lista nueva de residentes (con campo 'estado')
     * @returns {Array} Lista de cambios detectados
     */
    const detectarCambiosEstado = (datosActuales, datosNuevos) => {
        const cambios = [];

        // Crear mapa de residentes actuales por ID
        const mapaActual = new Map(datosActuales.map(r => [r.id, r]));

        // Comparar con nuevos datos
        datosNuevos.forEach(residenteNuevo => {
            const residenteActual = mapaActual.get(residenteNuevo.id);

            if (residenteActual) {
                // Verificar cambio de estado activo
                if (residenteActual.estado !== residenteNuevo.estado) {
                    cambios.push({
                        id: residenteNuevo.id,
                        nombre: residenteNuevo.nombre,
                        email: residenteNuevo.email,
                        cambio: residenteNuevo.estado === 'activo' ? 'activado' : 'desactivado',
                        anterior: residenteActual.estado === 'activo',
                        nuevo: residenteNuevo.estado === 'activo'
                    });
                }
            } else {
                // Detectar residentes nuevos que aparecen como activos
                // Esto indica que se activaron recientemente
                if (residenteNuevo.estado === 'activo') {
                    cambios.push({
                        id: residenteNuevo.id,
                        nombre: residenteNuevo.nombre,
                        email: residenteNuevo.email,
                        cambio: 'activado',
                        anterior: false, // Asumimos que era inactivo antes
                        nuevo: true
                    });
                }
            }
        });

        return cambios;
    };

    // Función de notificaciones específicas deshabilitada para evitar spam
    // Solo se usan las notificaciones generales de actualización

    /**
     * @description Muestra notificación de actualización de datos
     * Solo cuando hay cambios en los datos (no cada polling)
     */
    const mostrarNotificacionActualizacion = () => {
        const totalResidentes = residentes.length;
        const residentesActivos = residentes.filter(r => r.estado === 'activo').length;
        const residentesInactivos = totalResidentes - residentesActivos;

        // Solo mostrar si hay residentes inactivos (pendientes)
        if (residentesInactivos > 0) {
            toast.info(`Datos actualizados - ${residentesInactivos} residente${residentesInactivos > 1 ? 's' : ''} pendiente${residentesInactivos > 1 ? 's' : ''} de activación`, {
                duration: 3000 // 3 segundos
            });
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

    /**
     * @description Maneja la carga de un borrador desde el panel
     * @param {Object} datos - Datos del borrador a cargar
     */
    const handleCargarBorrador = (datos) => {
        setDatosBorrador(datos);
        setResidenteEditando(null); // No estamos editando
        setIsInvitarModalOpen(true);
    };

    /**
     * @description Maneja la edición de un residente
     * @param {Object} residente - Datos del residente a editar (desde la lista)
     */
    const handleEditarResidente = async (residente) => {
        try {
            // Obtener la lista de unidades para mapear numero_unidad a id
            const response = await apiService.get('/admin/unidades');
            const unidades = response.data.data?.unidades || [];

            // Encontrar la unidad correspondiente por numero_unidad
            const unidadCorrespondiente = unidades.find(unidad => unidad.numero_unidad === residente.numero_unidad);
            const unidadId = unidadCorrespondiente ? unidadCorrespondiente.id : '';

            // Mapear los datos al formato esperado por el formulario
            const datosMapeados = {
                nombre: residente.nombre || '',
                apellido: residente.apellido || '',
                email: residente.email || '',
                cedula: residente.cedula || '',
                telefono: residente.telefono || '',
                unidad_id: residente.numero_unidad // Mantener el numero_unidad (string) para preselección
            };

            setResidenteEditando(residente); // Guardar datos del residente para referencia
            setDatosBorrador(datosMapeados); // Precargar formulario
            setIsInvitarModalOpen(true);
        } catch (error) {
            console.error('Error al cargar unidades para edición:', error);
            toast.error('Error al preparar la edición del residente');
        }
    };

    /**
     * @description Maneja la suspensión de un residente
     * @param {Object} residente - Datos del residente a suspender
     */
    const handleSuspenderResidente = (residente) => {
        setResidenteASuspender(residente);
        setIsSuspenderModalOpen(true);
    };

    /**
     * @description Confirma y ejecuta la suspensión o reactivación del residente
     */
    const confirmarCambioEstado = async () => {
        if (!residenteASuspender) return;

        const esSuspension = residenteASuspender.estado !== 'suspendido';

        try {
            setEliminandoId(residenteASuspender.id);
            setIsSuspenderModalOpen(false);

            if (esSuspension) {
                // SUSPENDER: Usar DELETE que cambia estado a 'suspendido'
                await apiService.delete(`/admin/residentes/${residenteASuspender.id}`);
                toast.success(`Residente ${residenteASuspender.nombre} suspendido exitosamente`);
            } else {
                // REACTIVAR: Usar PATCH para cambiar estado a 'activo'
                await apiService.patch(`/admin/residentes/${residenteASuspender.id}`, {
                    estado: 'activo'
                });
                toast.success(`Residente ${residenteASuspender.nombre} reactivado exitosamente`);
            }

            cargarResidentes(); // Recargar la lista
        } catch (error) {
            console.error(`Error al ${esSuspension ? 'suspender' : 'reactivar'} residente:`, error);
            toast.error(`Error al ${esSuspension ? 'suspender' : 'reactivar'} el residente`);
        } finally {
            setEliminandoId(null);
            setResidenteASuspender(null);
        }
    };

    /**
     * @description Maneja el éxito de una invitación individual o edición
     * Recarga la lista, muestra mensaje de éxito y verifica auto-completado del setup wizard
     */
    const handleInvitacionExitosa = async () => {
        cargarResidentes();
        setIsInvitarModalOpen(false);
        setDatosBorrador(null); // Limpiar datos del borrador
        setResidenteEditando(null); // Limpiar residente editando

        const mensaje = residenteEditando ? 'Residente actualizado exitosamente' : 'Invitación enviada exitosamente';
        toast.success(mensaje);

        // SETUP WIZARD: Auto-completar si estamos en el paso de invitar residentes (solo para nuevas invitaciones)
        if (!residenteEditando) {
            const isInSetupWizard = usuario?.estado_configuracion === SETUP_STATES.PASO_3_RESIDENTES;

            if (isInSetupWizard) {
                try {
                    await apiService.post('/admin/configuracion/avanzar-paso');
                    await getProfile(); // Refrescar perfil para actualizar estado_configuracion
                    toast.success('¡Residente invitado! Setup completado.');
                } catch (error) {
                    console.error('Error al completar setup wizard:', error);
                    toast.error('Error al completar la configuración automática.');
                }
            }
        }
    };

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

    /**
     * @description Filtra residentes según término de búsqueda y estado
     * @returns {Array} Lista filtrada de residentes
     */
    const residentesFiltrados = residentes.filter(residente => {
        const coincideBusqueda = residente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                residente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                residente.numero_unidad?.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideEstado = filtroEstado === 'todos' ||
                              (filtroEstado === 'activos' && residente.estado === 'activo') ||
                              (filtroEstado === 'inactivos' && residente.estado !== 'activo');

        return coincideBusqueda && coincideEstado;
    });

    return (
        <div className="space-y-6">
            {/* HEADER: Título y acciones principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Residentes</h1>
                    <p className="text-gray-400 mt-1">
                        Administra las invitaciones de los residentes de tu edificio.
                        {ultimaActualizacion && tiempoIndicador && (
                            <span className="ml-2 text-xs text-gray-500">
                                • Datos actualizados {formatearTiempoRelativo(ultimaActualizacion)}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setDatosBorrador(null); // Limpiar datos de borrador
                            setIsInvitarModalOpen(true);
                        }}
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
                residentes={residentes}
                isLoading={isLoading}
            />

            {/* BORRADORES: Panel de invitaciones pendientes (si existen) */}
            <BorradoresPanel onCargarBorrador={handleCargarBorrador} />

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
                onClose={() => {
                    setIsInvitarModalOpen(false);
                    setDatosBorrador(null); // Limpiar datos al cerrar
                    setResidenteEditando(null); // Limpiar residente editando
                }}
                title={
                    residenteEditando ? "Editar Residente" :
                    datosBorrador ? "Continuar Invitación" :
                    "Invitar Nuevo Residente"
                }
            >
                <InvitarResidenteModal
                    onClose={() => {
                        setIsInvitarModalOpen(false);
                        setDatosBorrador(null);
                        setResidenteEditando(null);
                    }}
                    onSuccess={handleInvitacionExitosa}
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
                onClose={() => {
                    setIsSuspenderModalOpen(false);
                    setResidenteASuspender(null);
                }}
                title={residenteASuspender?.estado === 'suspendido' ? "Reactivar Residente" : "Suspender Residente"}
            >
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                             style={{ backgroundColor: residenteASuspender?.estado === 'suspendido' ? '#10b981' : '#f97316' }}>
                            <i className={`fas ${residenteASuspender?.estado === 'suspendido' ? 'fa-user-check' : 'fa-exclamation-triangle'} text-white text-lg`}></i>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            {residenteASuspender?.estado === 'suspendido'
                                ? "¿Estás seguro de reactivar a este residente?"
                                : "¿Estás seguro de suspender a este residente?"
                            }
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
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
                            onClick={() => {
                                setIsSuspenderModalOpen(false);
                                setResidenteASuspender(null);
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
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