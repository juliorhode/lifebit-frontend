import React, { useState, useEffect, useRef, useMemo } from 'react';
import apiService from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';
import { SETUP_STATES } from '../../../config/constants';
import TiposRecursoPanel from '../components/TiposRecursoPanel';
import GestionInventarioPanel from '../components/GestionInventarioPanel';
import Modal from '../../../components/ui/Modal';
import CrearTipoRecursoModal from '../components/CrearTipoRecursoModal';
import GeneradorInventarioModal from '../components/GeneradorInventarioModal';
import CargarArchivoModal from '../components/CargarArchivoModal';
import { toast } from 'react-hot-toast';
import FormularioEditarTipoRecurso from '../components/FormularioEditarTipoRecurso';
import ConfirmacionEliminarTipo from '../components/ConfirmacionEliminarTipo';
import FormularioEstructuraEdificio from '../components/FormularioEstructuraEdificio';
import { useNavigate } from 'react-router-dom';

/**
 * @description Página principal del módulo de recursos
 * Permite gestionar tipos de recursos e inventarios del edificio
 * Incluye funcionalidad condicional para el setup wizard
 * @returns {JSX.Element} Componente de la página de recursos
 */
const RecursosPage = () => {
    // Instanciamos el hook de navegación
    const navigate = useNavigate();
    // SETUP WIZARD: Hook para acceder al estado de autenticación y configuración
    const { usuario, getProfile } = useAuthStore();

    // --- LÓGICA DE ESTRUCTURA DEL EDIFICIO (MOVIDA AQUÍ) ---
    const { pisos_sotano, incluye_azotea, total_pisos } = usuario || {};
    const [isEstructuraModalOpen, setIsEstructuraModalOpen] = useState(false);
    const [isSubmittingEstructura, setIsSubmittingEstructura] = useState(false);

    // `useMemo` recalcula si la estructura está definida solo cuando los datos del usuario cambian.
    const isEstructuraDefinida = useMemo(() => pisos_sotano != null && incluye_azotea != null, [pisos_sotano, incluye_azotea]);

    // --- DATOS DERIVADOS ---
    // Generamos la lista de ubicaciones basándonos en la estructura del edificio.
    const listaUbicaciones = useMemo(() => {
        if (!isEstructuraDefinida) return [];
        const ubicaciones = [];
        for (let i = pisos_sotano || 0; i >= 1; i--) { ubicaciones.push(`Sótano ${i}`); }
        ubicaciones.push('Planta Baja');
        for (let i = 1; i <= total_pisos || 0; i++) { ubicaciones.push(`Piso ${i}`); }
        if (incluye_azotea) { ubicaciones.push('Azotea'); }
        return ubicaciones;
    }, [isEstructuraDefinida, total_pisos, pisos_sotano, incluye_azotea]);

    // El `useEffect` que comprueba la estructura ahora vive aquí, en el componente orquestador.
    // Se ejecuta cuando el componente se monta o cuando `isEstructuraDefinida` cambia.
    useEffect(() => {
        // Si la estructura no está definida y el usuario ya ha cargado, abrimos el modal.
        if (usuario && !isEstructuraDefinida) {
            setIsEstructuraModalOpen(true);
        }
    }, [usuario, isEstructuraDefinida]);

    const guardarEstructuraEdificio = async (data) => {
        setIsSubmittingEstructura(true);
        try {
            await apiService.patch('/admin/unidades/edificio', data);
            await getProfile(); // Refrescamos el estado global del usuario.
            toast.success('Estructura guardada exitosamente.');
            setIsEstructuraModalOpen(false); // Cerramos el modal.
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo guardar la estructura.');
        } finally {
            setIsSubmittingEstructura(false);
        }
    };

    /**
     * @description Maneja el cierre del modal de estructura.
     * Si el usuario cierra el modal sin completar la información, es redirigido
     * al dashboard para prevenir que continúe en un estado de configuración incompleto.
     */
    const handleCerrarModalEstructura = () => {
        if (isSubmittingEstructura) return; // No permitir cerrar si está procesando.

        setIsEstructuraModalOpen(false);
        // 3. Redirigimos al usuario al dashboard.
        navigate('/dashboard');
        toast.info('Completa la estructura del edificio para poder gestionar el inventario.');
    };

    const [tiposDeRecurso, setTiposDeRecurso] = useState([]);
    const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
    const [isLoadingTipos, setIsLoadingTipos] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isGeneradorModalOpen, setIsGeneradorModalOpen] = useState(false);
    const [isCargarModalOpen, setIsCargarModalOpen] = useState(false);
    const [tipoAEditar, setTipoAEditar] = useState(null);
    const [tipoAEliminar, setTipoAEliminar] = useState(null);
    /**
     * @description Estado que indica si se han generado items de inventario
     * CRÍTICO PARA SETUP WIZARD: Controla la visibilidad del botón "Continuar"
     *
     * Problema anterior: Se perdía al refrescar la página porque era solo estado local
     * Solución: Persistir en localStorage para mantener consistencia
     *
     * @type {boolean} true si hay items generados, false si no
     */
    const [hasItemsGenerados, setHasItemsGenerados] = useState(() => {
        // 📖 LECTURA INICIAL: Intentar leer del localStorage
        // Si existe, usar ese valor; si no, usar false como valor por defecto
        try {
            const saved = localStorage.getItem('recursos_hasItemsGenerados');
            const parsedValue = saved ? JSON.parse(saved) : false;

            return parsedValue;
        } catch (error) {
            // 🛡️ FALLBACK: Si hay error leyendo localStorage, usar false
            console.warn('⚠️ RecursosPage: Error leyendo localStorage, usando false:', error);
            return false;
        }
    });

    /**
     * @description Referencia al componente GestionInventarioPanel
     * Se usa para refrescar los datos después de cambios en el inventario
     */
    const gestionInventarioRef = useRef();

    const fetchTiposDeRecurso = async () => {
        setIsLoadingTipos(true);
        try {
            const response = await apiService.get('/admin/recursos/tipos');
            setTiposDeRecurso(response.data.data.tiposRecurso);
        } catch (error) {
            console.error("Error al obtener tipos de recurso:", error);
            // Si es un 401, confiamos en que el interceptor de apiService lo está manejando.
            if (error.response?.status !== 401) {
                toast.error('No se pudieron cargar los datos del módulo.');
            }
        } finally {
            setIsLoadingTipos(false);
        }
    };

    useEffect(() => {
        fetchTiposDeRecurso();
    }, []);

    const tipoSeleccionado = tiposDeRecurso.find(t => t.id === tipoSeleccionadoId) || null;

    // ============================================================================
    // 🎯 SETUP WIZARD: LÓGICA CONDICIONAL PARA BOTÓN "CONTINUAR"
    // ============================================================================
    // Esta sección controla cuándo mostrar el botón "Continuar a Residentes"
    // Es CRÍTICA para la experiencia del usuario en el setup inicial

    /**
     * @description Verifica si el usuario está en el paso 2 del setup wizard
     * Este paso corresponde a la configuración de recursos del edificio
     */
    const isInSetupWizard = usuario?.estado_configuracion === SETUP_STATES.PASO_2_RECURSOS;

    /**
     * @description Verifica si se han creado tipos de recursos
     * Al menos un tipo de recurso debe existir para poder continuar
     */
    const hasTiposRecursos = tiposDeRecurso.length > 0;

    /**
     * @description Estado crítico: Verifica si hay items de inventario generados
     * ANTES: Este estado se perdía al refrescar → Problema solucionado con localStorage
     * AHORA: Se mantiene consistente gracias a actualizarEstadoItems()
     *
     * Esta condición determina si el usuario puede continuar al siguiente paso
     */
    const hasRecursosCompletos = hasTiposRecursos && hasItemsGenerados;

    /**
     * @description Condición final: Mostrar botón "Continuar" solo si:
     * 1. El usuario está en setup wizard (paso 2)
     * 2. Tiene tipos de recursos creados
     * 3. ✅ NUEVO: Tiene items de inventario generados (persistido en localStorage)
     *
     * Si esta condición es false:
     * - El botón "Continuar" no se muestra
     * - Se muestra el mensaje informativo en su lugar
     */
    const showContinueButton = isInSetupWizard && hasRecursosCompletos;

    // SETUP WIZARD: Handler para avanzar al siguiente paso del setup
    const handleContinuarASiguientePaso = async () => {
        try {
            await apiService.post('/admin/configuracion/avanzar-paso');
            await getProfile(); // Refresca el perfil para actualizar estado_configuracion
            toast.success('¡Paso completado! Continuando con la configuración...');
        } catch (error) {
            console.error('Error al avanzar al siguiente paso:', error);
            toast.error('Error al avanzar al siguiente paso.');
        }
    };

    const handleModalSuccess = () => {
        setTipoAEditar(null);
        setTipoAEliminar(null);
        setIsCreateModalOpen(false);
        fetchTiposDeRecurso();
    };

    const handleModalCancel = () => {
        setTipoAEditar(null);
        setTipoAEliminar(null);
        setIsCreateModalOpen(false);
    };

    /**
     * @description Función centralizada para actualizar el estado hasItemsGenerados
     * SOLUCIÓN AL PROBLEMA: Persiste el estado en localStorage para sobrevivir refrescos
     *
     * @param {boolean} nuevoEstado - El nuevo valor del estado (true/false)
     *
     * Flujo:
     * 1. Actualiza el estado local con setHasItemsGenerados
     * 2. Persiste en localStorage para mantener consistencia
     * 3. Loggea para debugging y monitoreo
     *
     * Beneficios:
     * - ✅ Sobrevive a refrescos de página
     * - ✅ Funciona sin conexión a internet
     * - ✅ Más rápido que llamadas API
     * - ✅ Sincronizado entre pestañas del mismo navegador
     */
    const actualizarEstadoItems = (nuevoEstado) => {
        // 🔄 1. Actualizar estado local
        setHasItemsGenerados(nuevoEstado);

        // 💾 2. Persistir en localStorage
        try {
            localStorage.setItem('recursos_hasItemsGenerados', JSON.stringify(nuevoEstado));
        } catch (error) {
            // 🛡️ 3. Manejo de errores - si localStorage falla, al menos mantener estado local
            console.error('Error guardando en localStorage:', error);
            // El estado local ya se actualizó, así que la funcionalidad básica sigue funcionando
        }
    };

    /**
     * @description Handler ejecutado cuando se completa una operación de inventario
     * CRÍTICO PARA SETUP WIZARD: Marca que se han generado items para mostrar botón "Continuar"
     *
     * Flujo de ejecución:
     * 1. Cerrar modales abiertos (generador/carga)
     * 2. Refrescar el panel de inventario para mostrar nuevos datos
     * 3. ✅ NUEVO: Marcar que hay items generados usando actualizarEstadoItems
     * 4. Mostrar notificación de éxito al usuario
     *
     * Importancia: Esta función se ejecuta después de:
     * - Generar inventario secuencialmente
     * - Cargar inventario desde archivo Excel
     * - Cualquier operación que agregue items al inventario
     */
    const handleInventarioChange = () => {
        // 🪟 1. Cerrar modales que puedan estar abiertos
        setIsGeneradorModalOpen(false);
        setIsCargarModalOpen(false);

        // 🔄 2. Refrescar el panel de inventario para mostrar los nuevos datos
        if (gestionInventarioRef.current) {
            gestionInventarioRef.current.refrescar();
        }

        // ✅ 3. CRÍTICO: Marcar que se han generado items de inventario
        // ANTES: setHasItemsGenerados(true); // Se perdía al refrescar
        // AHORA: actualizarEstadoItems(true); // Se persiste en localStorage
        actualizarEstadoItems(true);

        // 🔔 4. Notificar al usuario que la operación fue exitosa
        toast.success('¡Inventario actualizado exitosamente!');
    };

    // AQUI VA EL CAMBIO: El handler que recibe la señal de éxito desde los paneles de asignación.
    const handleInventarioActualizado = () => {
        if (gestionInventarioRef.current) {
            gestionInventarioRef.current.refrescar();
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <TiposRecursoPanel
                        tipos={tiposDeRecurso}
                        tipoSeleccionadoId={tipoSeleccionadoId}
                        onSelectTipo={setTipoSeleccionadoId}
                        onCrearTipo={() => setIsCreateModalOpen(true)}
                        isLoading={isLoadingTipos}
                        onEditarTipo={setTipoAEditar}
                        onEliminarTipo={setTipoAEliminar}
                    />
                </div>

                <div className="lg:col-span-2">
                    <GestionInventarioPanel
                        ref={gestionInventarioRef}
                        tipoSeleccionado={tipoSeleccionado}
                        onGenerarClick={() => setIsGeneradorModalOpen(true)}
                        onCargarClick={() => setIsCargarModalOpen(true)}
                        onInventarioChange={handleInventarioActualizado}
                        listaUbicaciones={listaUbicaciones}
                    />
                </div>
            </div>

            {/* --- MODALES --- */}

            {/* Modal para definir la estructura del edificio */}
            <Modal
                isOpen={isEstructuraModalOpen}
                // 4. Conectamos el `onClose` a nuestro nuevo handler.
                onClose={handleCerrarModalEstructura}
                title="Completar Información del Edificio"
            >
                <FormularioEstructuraEdificio
                    onSubmit={guardarEstructuraEdificio}
                    isSubmitting={isSubmittingEstructura}
                />
            </Modal>

            {/* Modal para crear nuevos tipos de recurso */}
            <Modal isOpen={isCreateModalOpen} onClose={handleModalCancel} title="Añadir Nuevos Tipos de Recurso">
                <CrearTipoRecursoModal onClose={handleModalCancel} onRecursosCreados={handleModalSuccess} />
            </Modal>

            {/* Modal para editar tipos de recurso */}
            {tipoAEditar && (
                <Modal isOpen={!!tipoAEditar} onClose={handleModalCancel} title={`Modificar "${tipoAEditar.nombre}"`}>
                    <FormularioEditarTipoRecurso
                        tipo={tipoAEditar}
                        onSuccess={handleModalSuccess}
                        onCancel={handleModalCancel}
                    />
                </Modal>
            )}

            {/* Modal para confirmar eliminación de tipos de recurso */}
            {tipoAEliminar && (
                <Modal isOpen={!!tipoAEliminar} onClose={handleModalCancel} title="Confirmar Eliminación">
                    <ConfirmacionEliminarTipo
                        tipo={tipoAEliminar}
                        onSuccess={handleModalSuccess}
                        onCancel={handleModalCancel}
                    />
                </Modal>
            )}

            {tipoSeleccionado && (
                <>
                    {/* Modal para generar inventario secuencial */}
                    <Modal
                        isOpen={isGeneradorModalOpen}
                        onClose={() => setIsGeneradorModalOpen(false)}
                        title="Generador de Inventario Secuencial"
                    >
                        <GeneradorInventarioModal
                            onClose={() => setIsGeneradorModalOpen(false)}
                            onSuccess={handleInventarioChange}
                            tipoRecurso={tipoSeleccionado}
                        />
                    </Modal>

                    {/* Modal para cargar inventario desde archivo */}
                    <Modal isOpen={isCargarModalOpen} onClose={() => setIsCargarModalOpen(false)} title={`Cargar Inventario para ${tipoSeleccionado.nombre}`}>
                        <CargarArchivoModal
                            onClose={() => setIsCargarModalOpen(false)}
                            onSuccess={handleInventarioChange}
                            tipoRecurso={tipoSeleccionado}
                        />
                    </Modal>
                </>
            )}

            {/* ============================================================================
                🎯 SETUP WIZARD: BOTÓN "CONTINUAR A RESIDENTES"
                ============================================================================
                Este botón aparece SOLO cuando se cumplen TODAS las condiciones:

                ✅ Usuario está en setup wizard (paso 2)
                ✅ Tiene al menos un tipo de recurso creado
                ✅ ✅ NUEVO: Tiene items de inventario generados (persistido en localStorage)

                Problema solucionado:
                ANTES: Al refrescar, hasItemsGenerados volvía a false → Botón desaparecía
                AHORA: localStorage mantiene el estado → Botón permanece visible

                UX Impact: Sin este botón, el usuario se queda "atascado" en el setup
            */}
            {showContinueButton && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleContinuarASiguientePaso}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-all duration-200 hover:shadow-xl animate-pulse"
                        title="Continuar al siguiente paso del setup"
                    >
                        <i className="fas fa-arrow-right mr-2"></i>
                        Continuar a Residentes
                    </button>
                </div>
            )}

            {/* ============================================================================
                ℹ️ SETUP WIZARD: MENSAJE INFORMATIVO CUANDO NO SE PUEDE CONTINUAR
                ============================================================================
                Este mensaje aparece cuando showContinueButton es false
                Guía al usuario sobre qué necesita hacer para desbloquear el siguiente paso

                Lógica condicional:
                1. Si no hay tipos de recursos → "Crea al menos un tipo de recurso..."
                2. Si hay tipos pero no items → "Ahora genera items de inventario..."

                UX Importante:
                - Proporciona instrucciones claras y accionables
                - Evita que el usuario se sienta "atascado"
                - Guía el siguiente paso lógico en el flujo

                Problema solucionado:
                ANTES: Después de refrescar, aparecía este mensaje aunque había items generados
                AHORA: Gracias a localStorage, mantiene el estado correcto
            */}
            {isInSetupWizard && !hasRecursosCompletos && (
                <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg">
                    <div className="flex items-center text-blue-900 dark:text-blue-200">
                        <i className="fas fa-info-circle mr-3 text-blue-400"></i>
                        <span>
                            {/* 🔀 LÓGICA CONDICIONAL: Mensaje específico según el estado */}
                            {!hasTiposRecursos
                                ? "Crea al menos un tipo de recurso para poder continuar al siguiente paso del setup."
                                : "Ahora genera items de inventario para los tipos de recursos creados usando 'Generar Secuencialmente' o 'Cargar desde Archivo'."
                            }
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecursosPage;
