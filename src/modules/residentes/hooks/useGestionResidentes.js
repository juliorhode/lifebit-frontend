import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { SETUP_STATES } from '../../../config/constants';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

/**
 * @description Hook maestro para gestionar toda la lógica de la página de Residentes.
 * Actúa como una fachada, ocultando la complejidad y proveyendo una API simple a la UI.
 *
 * FUNCIONALIDADES:
 * ✅ Gestión completa de residentes (CRUD)
 * ✅ Sistema de borradores con localStorage
 * ✅ ✅ NUEVO: Limpieza automática de borradores al enviar invitación
 * ✅ Filtros y búsqueda en tiempo real
 * ✅ Estadísticas calculadas automáticamente
 * ✅ Gestión de modales y estados de UI
 *
 * LIMPIEZA DE BORRADORES:
 * Cuando se envía exitosamente una invitación desde un borrador:
 * 1. Se identifica el borrador por nombre, apellido y email
 * 2. Se elimina del localStorage
 * 3. El panel de borradores se actualiza automáticamente
 * 4. Se muestra confirmación de éxito
 */
export const useGestionResidentes = () => {
    // --- DEPARTAMENTO DE DATOS Y LOGÍSTICA ---
    const { usuario, getProfile } = useAuthStore();
    const [residentes, setResidentes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

    // --- DEPARTAMENTO DE ESTRATEGIA (Filtros y Búsqueda) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    // --- DEPARTAMENTO DE OPERACIONES (Gestión de Modales y Contexto) ---
    const [isInvitarModalOpen, setIsInvitarModalOpen] = useState(false);
    const [isMasivoModalOpen, setIsMasivoModalOpen] = useState(false);
    const [isSuspenderModalOpen, setIsSuspenderModalOpen] = useState(false);
    const [residenteEditando, setResidenteEditando] = useState(null);
    const [residenteASuspender, setResidenteASuspender] = useState(null);
    const [datosBorrador, setDatosBorrador] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);

    // ✅ NUEVO: Estado para refrescar el panel de borradores
    const [borradoresRefreshTrigger, setBorradoresRefreshTrigger] = useState(0);

    // --- LÓGICA DE CARGA Y ACTUALIZACIÓN DE DATOS ---

    const cargarResidentes = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        cargarResidentes();
    }, [cargarResidentes]);
    
    // --- LÓGICA DE FILTRADO (Dato Derivado con useMemo) ---
    const residentesFiltrados = useMemo(() => {
        return residentes.filter(residente => {
            const coincideBusqueda = 
                residente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                residente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                residente.numero_unidad?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const coincideEstado = 
                filtroEstado === 'todos' ||
                (filtroEstado === 'activos' && residente.estado === 'activo') ||
                (filtroEstado === 'inactivos' && residente.estado !== 'activo');
            
            return coincideBusqueda && coincideEstado;
        });
    }, [residentes, searchTerm, filtroEstado]);
    
    // --- LÓGICA DE ESTADÍSTICAS (Dato Derivado con useMemo) ---
    const estadisticas = useMemo(() => {
        const total = residentes.length;
        const activos = residentes.filter(r => r.estado === 'activo').length;
        const pendientes = total - activos;
        return { total, activos, pendientes };
    }, [residentes]);


    // --- HANDLERS PARA ABRIR MODALES Y ESTABLECER CONTEXTO ---
    const handleOpenInvitarModal = () => {
        setResidenteEditando(null);
        setDatosBorrador(null);
        setIsInvitarModalOpen(true);
    };

    /**
     * @description Maneja la carga de un borrador desde localStorage
     * Establece los datos del borrador CON SU ID ORIGINAL y abre el modal de invitación
     * @param {Object} datosBorrador - Datos del borrador a cargar en el formulario
     * @param {string} borradorId - ID único del borrador para mantener consistencia
     */
    const handleCargarBorrador = (datosBorrador, borradorId = null) => {
        console.log('🎯 useGestionResidentes.handleCargarBorrador - INICIO');
        console.log('🎯 Datos del borrador recibido:', datosBorrador);
        console.log('🎯 ID del borrador recibido:', borradorId);
        console.log('🎯 ID en datosBorrador:', datosBorrador.id);

        // ✅ Si no se proporciona ID, intentar extraerlo de los datos
        let idFinal = borradorId;
        if (!idFinal && datosBorrador.id) {
            idFinal = datosBorrador.id;
            console.log('🎯 ID extraído de datosBorrador:', idFinal);
        }

        // ✅ Crear datos completos incluyendo el ID
        const datosCompletos = {
            ...datosBorrador,
            id: idFinal // ✅ Incluir ID para que llegue a useResidenteForm
        };

        console.log('🎯 Datos completos a enviar:', datosCompletos);
        console.log('🎯 ID final en datosCompletos:', datosCompletos.id);

        setResidenteEditando(null); // No estamos editando, es un borrador
        setDatosBorrador(datosCompletos); // Establecer datos completos del borrador
        setIsInvitarModalOpen(true); // Abrir modal

        console.log('🎯 useGestionResidentes.handleCargarBorrador - FIN');
    };

    const handleEditarResidente = (residente) => {
        setResidenteEditando(residente);
        setIsInvitarModalOpen(true);
    };

    const handleSuspenderResidente = (residente) => {
        setResidenteASuspender(residente);
        setIsSuspenderModalOpen(true);
    };
    
    const handleCloseModals = () => {
        console.log('🚪 useGestionResidentes.handleCloseModals - INICIO');
        console.log('🚪 Estado antes de cerrar:');
        console.log('  - isInvitarModalOpen:', isInvitarModalOpen);
        console.log('  - isMasivoModalOpen:', isMasivoModalOpen);
        console.log('  - isSuspenderModalOpen:', isSuspenderModalOpen);
        console.log('  - residenteEditando:', residenteEditando);
        console.log('  - residenteASuspender:', residenteASuspender);
        console.log('  - datosBorrador:', datosBorrador);

        console.log('🚪 Cambiando isInvitarModalOpen de', isInvitarModalOpen, 'a false');
        setIsInvitarModalOpen(false);
        setIsMasivoModalOpen(false);
        setIsSuspenderModalOpen(false);
        setResidenteEditando(null);
        setResidenteASuspender(null);
        setDatosBorrador(null);

        console.log('🚪 useGestionResidentes.handleCloseModals - FIN');
        console.log('🚪 Todos los modales cerrados y estados limpiados');

        // Verificar el estado después de un breve delay
        setTimeout(() => {
            console.log('🚪 Verificación post-cierre - isInvitarModalOpen debería ser false');
        }, 100);
    };

    // --- LÓGICA DE ACCIONES (Llamadas a API de modificación) ---
    const confirmarCambioEstado = async () => {
        if (!residenteASuspender) return;
        const esSuspension = residenteASuspender.estado !== 'suspendido';
        try {
            setEliminandoId(residenteASuspender.id);
            if (esSuspension) {
                await apiService.delete(`/admin/residentes/${residenteASuspender.id}`);
                toast.success(`Residente ${residenteASuspender.nombre} suspendido`);
            } else {
                await apiService.patch(`/admin/residentes/${residenteASuspender.id}`, { estado: 'activo' });
                toast.success(`Residente ${residenteASuspender.nombre} reactivado`);
            }
            handleCloseModals();
            cargarResidentes();
        } catch (error) {
            toast.error(`Error al ${esSuspension ? 'suspender' : 'reactivar'}`);
        } finally {
            setEliminandoId(null);
        }
    };
    
    /**
     * @description Maneja el éxito de una invitación individual o edición
     * ✅ NUEVO: Incluye limpieza automática de borradores utilizados
     *
     * FLUJO COMPLETO:
     * 1. Cerrar modales abiertos
     * 2. ✅ LIMPIEZA DE BORRADOR: Si se invitó desde borrador, eliminarlo
     * 3. Recargar lista de residentes
     * 4. Mostrar mensaje de éxito
     *
     * LIMPIEZA DE BORRADORES:
     * - Solo se ejecuta si hay datosBorrador y no es edición
     * - Busca en localStorage por nombre, apellido y email
     * - Elimina el primer match encontrado
     * - Maneja errores de parsing gracefully
     * - Loggea la eliminación para debugging
     *
     * @returns {void}
     */
    /**
     * @description Maneja el éxito de una invitación individual o edición
     * ✅ NUEVO: Incluye limpieza automática de borradores utilizados
     *
     * FLUJO COMPLETO:
     * 1. Cerrar modales abiertos
     * 2. ✅ LIMPIEZA DE BORRADOR: Si se invitó desde borrador, eliminarlo
     * 3. Recargar lista de residentes
     * 4. Notificar éxito
     *
     * LIMPIEZA DE BORRADORES:
     * - Solo se ejecuta si hay datosBorrador y no es edición
     * - Busca en localStorage por nombre, apellido y email
     * - Elimina el primer match encontrado
     * - Maneja errores de parsing gracefully
     * - Loggea la eliminación para debugging
     *
     * @returns {void}
     */
    const handleInvitacionExitosa = () => {
        console.log('🎉 handleInvitacionExitosa - INICIO');
        console.log('🎉 Estado completo:', {
            datosBorrador,
            residenteEditando,
            isInvitarModalOpen,
            borradorIdPersistente
        });
        console.log('🎉 datosBorrador detallado:', JSON.stringify(datosBorrador, null, 2));

        // Verificar si hay un borrador para eliminar
        if (datosBorrador && !residenteEditando) {
            console.log('🎉 Hay borrador para eliminar:', datosBorrador.id);
        } else {
            console.log('🎉 No hay borrador para eliminar o es edición');
        }

        // 🧹 PASO 2: LIMPIEZA AUTOMÁTICA DE BORRADORES
        // Si se invitó exitosamente desde un borrador, eliminarlo para evitar duplicados
        if (datosBorrador && !residenteEditando) {
            console.log('🧹 Iniciando limpieza de borrador usado...');
            console.log('🧹 Buscando borrador con datos:', {
                nombre: datosBorrador.nombre,
                apellido: datosBorrador.apellido,
                email: datosBorrador.email,
                id: datosBorrador.id
            });

            let borradorEncontrado = false;

            // 🔍 Buscar el borrador correspondiente en localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    try {
                        const borrador = JSON.parse(localStorage.getItem(key));
                        console.log('🧹 Revisando borrador:', key, borrador);

                        // 🎯 PRIORIDAD 1: Comparar por ID único (más específico)
                        let esElBorradorCorrecto = false;

                        if (datosBorrador.id && borrador.id === datosBorrador.id) {
                            console.log('🧹 ✅ Match por ID único:', borrador.id);
                            esElBorradorCorrecto = true;
                        }
                        // 🎯 PRIORIDAD 2: Comparar por datos clave (fallback)
                        else if (borrador.nombre === datosBorrador.nombre &&
                                 borrador.apellido === datosBorrador.apellido &&
                                 borrador.email === datosBorrador.email) {
                            console.log('🧹 ⚠️ Match por datos (posible duplicado):', borrador.email);
                            esElBorradorCorrecto = true;
                        }

                        if (esElBorradorCorrecto) {
                            console.log('🗑️ Eliminando borrador encontrado:', key);
                            // 🗑️ Eliminar el borrador encontrado
                            localStorage.removeItem(key);
                            console.log('✅ Borrador eliminado exitosamente:', key);
                            borradorEncontrado = true;
                            break; // Solo eliminar el primer match
                        }
                    } catch (error) {
                        // ⚠️ Manejo de errores: Si hay problemas parseando, continuar
                        console.warn('⚠️ Error procesando borrador en localStorage:', error);
                        // No lanzamos error para no interrumpir el flujo de éxito
                    }
                }
            }

            if (!borradorEncontrado) {
                console.warn('⚠️ No se encontró borrador para eliminar');
            }

            console.log('🧹 Limpieza de borrador completada');
        } else {
            console.log('🧹 No se requiere limpieza de borrador');
        }

        console.log('🎉 Cerrando modal después de invitación exitosa...');
        handleCloseModals();
        console.log('🎉 handleInvitacionExitosa - FIN');

        // 🪟 PASO 1: Cerrar modales
        handleCloseModals();

        // 🔄 PASO 3: Recargar datos
        cargarResidentes();

        // ✅ PASO 4: Notificar éxito
        const mensaje = residenteEditando ? 'Residente actualizado' : 'Invitación enviada';
        toast.success(`${mensaje} exitosamente`);
    };

    /**
     * @description Maneja el guardado exitoso de un borrador
     * ✅ NUEVO: Refresca el panel de borradores para mostrar el nuevo borrador
     *
     * @returns {void}
     */
    const handleBorradorGuardado = () => {
        console.log('💾 useGestionResidentes.handleBorradorGuardado - INICIO');
        console.log('💾 Trigger anterior:', borradoresRefreshTrigger);
        setBorradoresRefreshTrigger(prev => prev + 1); // ✅ Incrementa el trigger para refrescar
        console.log('💾 Trigger actualizado:', borradoresRefreshTrigger + 1);
        console.log('💾 useGestionResidentes.handleBorradorGuardado - FIN');
    };

    // --- API PÚBLICA DEL HOOK: Lo que se devuelve al componente ---
    return {
        // Datos
        residentesFiltrados,
        estadisticas,
        isLoading,
        ultimaActualizacion,
        
        // Estado y Setters de UI
        searchTerm,
        setSearchTerm,
        filtroEstado,
        setFiltroEstado,
        
        // Estado y Handlers de Modales
        isInvitarModalOpen,
        isMasivoModalOpen,
        isSuspenderModalOpen,
        residenteEditando,
        residenteASuspender,
        datosBorrador,
        handleOpenInvitarModal,
        handleCargarBorrador, // ✅ NUEVO: Para cargar borradores desde localStorage
        setIsMasivoModalOpen, // Se pasa directo para simplicidad
        handleEditarResidente,
        handleSuspenderResidente,
        handleCloseModals,

        // Acciones
        confirmarCambioEstado,
        eliminandoId,
        handleInvitacionExitosa,
        handleBorradorGuardado, // ✅ NUEVO: Para refrescar panel de borradores

        // Funciones de Refresco
        cargarResidentes,
        borradoresRefreshTrigger, // ✅ NUEVO: Trigger para refrescar borradores
    };
};