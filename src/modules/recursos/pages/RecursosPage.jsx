import React, { useState, useEffect, useRef } from 'react';
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

/**
 * @description Página principal del módulo de recursos
 * Permite gestionar tipos de recursos e inventarios del edificio
 * Incluye funcionalidad condicional para el setup wizard
 * @returns {JSX.Element} Componente de la página de recursos
 */
const RecursosPage = () => {
    // SETUP WIZARD: Hook para acceder al estado de autenticación y configuración
    const { usuario, getProfile } = useAuthStore();

    const [tiposDeRecurso, setTiposDeRecurso] = useState([]);
    const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
    const [isLoadingTipos, setIsLoadingTipos] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isGeneradorModalOpen, setIsGeneradorModalOpen] = useState(false);
    const [isCargarModalOpen, setIsCargarModalOpen] = useState(false);
    const [tipoAEditar, setTipoAEditar] = useState(null);
    const [tipoAEliminar, setTipoAEliminar] = useState(null);
    const [hasItemsGenerados, setHasItemsGenerados] = useState(false);
    const gestionInventarioRef = useRef();

    const fetchTiposDeRecurso = async () => {
        setIsLoadingTipos(true);
        try {
            const response = await apiService.get('/admin/recursos/tipos');
            setTiposDeRecurso(response.data.data.tiposRecurso);
        } catch (error) {
            console.error("Error al obtener tipos de recurso:", error);
            toast.error("No se pudo cargar la lista de tipos de recurso.");
        } finally {
            setIsLoadingTipos(false);
        }
    };

    useEffect(() => {
        fetchTiposDeRecurso();
    }, []);

    const tipoSeleccionado = tiposDeRecurso.find(t => t.id === tipoSeleccionadoId) || null;

    // SETUP WIZARD: Lógica condicional para mostrar botón de continuar
    // Se requiere: tipos de recursos creados + items de inventario generados
    const isInSetupWizard = usuario?.estado_configuracion === SETUP_STATES.PASO_2_RECURSOS;
    const hasTiposRecursos = tiposDeRecurso.length > 0;
    const hasRecursosCompletos = hasTiposRecursos && hasItemsGenerados;
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

    const handleInventarioChange = () => {
        setIsGeneradorModalOpen(false);
        setIsCargarModalOpen(false);
        if (gestionInventarioRef.current) {
            gestionInventarioRef.current.refrescar();
        }
        // SETUP WIZARD: Marcar que se han generado items de inventario
        setHasItemsGenerados(true);
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
                        // AQUI VA EL CAMBIO: Conectamos el handler al panel.
                        onInventarioChange={handleInventarioActualizado}
                    />
                </div>
            </div>

            {/* --- MODALES --- */}

            <Modal isOpen={isCreateModalOpen} onClose={handleModalCancel} title="Añadir Nuevos Tipos de Recurso">
                <CrearTipoRecursoModal onClose={handleModalCancel} onRecursosCreados={handleModalSuccess} />
            </Modal>

            {tipoAEditar && (
                <Modal isOpen={!!tipoAEditar} onClose={handleModalCancel} title={`Modificar "${tipoAEditar.nombre}"`}>
                    <FormularioEditarTipoRecurso
                        tipo={tipoAEditar}
                        onSuccess={handleModalSuccess}
                        onCancel={handleModalCancel}
                    />
                </Modal>
            )}

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

                    <Modal isOpen={isCargarModalOpen} onClose={() => setIsCargarModalOpen(false)} title={`Cargar Inventario para ${tipoSeleccionado.nombre}`}>
                        <CargarArchivoModal
                            onClose={() => setIsCargarModalOpen(false)}
                            onSuccess={handleInventarioChange}
                            tipoRecurso={tipoSeleccionado}
                        />
                    </Modal>
                </>
            )}

            {/* SETUP WIZARD: Botón condicional para continuar al siguiente paso */}
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

            {/* SETUP WIZARD: Mensaje informativo cuando no hay recursos completos */}
            {isInSetupWizard && !hasRecursosCompletos && (
                <div className="mt-8 p-4 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg">
                    <div className="flex items-center text-blue-200">
                        <i className="fas fa-info-circle mr-3 text-blue-400"></i>
                        <span>
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