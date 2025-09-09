import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/apiService';
import TiposRecursoPanel from '../components/TiposRecursoPanel';
import GestionInventarioPanel from '../components/GestionInventarioPanel';
import Modal from '../../../components/ui/Modal';
import CrearTipoRecursoModal from '../components/CrearTipoRecursoModal';
import GeneradorInventarioModal from '../components/GeneradorInventarioModal';
import CargarArchivoModal from '../components/CargarArchivoModal';
import { toast } from 'react-hot-toast';

/**
 * @description
 * Página principal para la gestión de Recursos. Actúa como el componente contenedor que orquesta
 * la interacción entre el panel de tipos de recurso, el panel de gestión de inventario y los diversos
 * modales (crear tipo, generar inventario, cargar archivo).
 */
const RecursosPage = () => {

    // --- ESTADO --- //

    /** @type {[Array<object>, function]} tiposDeRecurso - Almacena la lista de todos los tipos de recurso (ej: Silla, Proyector) traídos de la API. */
    const [tiposDeRecurso, setTiposDeRecurso] = useState([]);
    /** @type {[number|null, function]} tipoSeleccionadoId - Guarda el ID del tipo de recurso que el usuario ha seleccionado en el `TiposRecursoPanel`. */
    const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
    /** @type {[boolean, function]} isLoadingTipos - Controla el estado de carga para la obtención inicial de los tipos de recurso. */
    const [isLoadingTipos, setIsLoadingTipos] = useState(true);
    /** @type {[boolean, function]} isCreateModalOpen - Controla la visibilidad del modal para crear un nuevo tipo de recurso. */
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    /** @type {[boolean, function]} isGeneradorModalOpen - Controla la visibilidad del modal para generar inventario secuencial. */
    const [isGeneradorModalOpen, setIsGeneradorModalOpen] = useState(false);
    /** @type {[boolean, function]} isCargarModalOpen - Controla la visibilidad del modal para cargar inventario desde un archivo. */
    const [isCargarModalOpen, setIsCargarModalOpen] = useState(false);

    /** @type {React.RefObject} gestionInventarioRef - Referencia al componente `GestionInventarioPanel` para poder invocar métodos en él (ej: `refrescar`). */
    const gestionInventarioRef = useRef();

    // --- DATOS Y EFECTOS --- //

    /**
     * @description Obtiene la lista de todos los tipos de recurso desde el backend y actualiza el estado.
     */
    const fetchTiposDeRecurso = async () => {
        setIsLoadingTipos(true);
        try {
            const response = await apiService.get('/admin/recursos/tipos');
            setTiposDeRecurso(response.data.data.tiposRecurso);
        } catch (error) {
            console.error("Error al obtener tipos de recurso:", error);
        } finally {
            setIsLoadingTipos(false);
        }
    };

    // Carga los tipos de recurso una vez cuando el componente se monta.
    useEffect(() => { fetchTiposDeRecurso(); }, []);

    /** @description Variable computada que encuentra el objeto completo del tipo de recurso seleccionado a partir de su ID. */
    const tipoSeleccionado = tiposDeRecurso.find(t => t.id === tipoSeleccionadoId) || null;

    // --- MANEJADORES DE EVENTOS (HANDLERS) --- //

    /**
     * @description Callback que se ejecuta cuando el modal de creación de tipos se cierra exitosamente.
     * Cierra el modal y refresca la lista de tipos para mostrar el nuevo.
     */
    const handleRecursosCreados = () => {
        setIsCreateModalOpen(false);
        fetchTiposDeRecurso();
    };

    /**
     * @description Callback que se ejecuta cuando el generador de inventario termina exitosamente.
     * Cierra el modal y llama al método `refrescar` del panel de inventario para mostrar los nuevos datos.
     */
    const handleInventarioGenerado = () => {
        setIsGeneradorModalOpen(false);
        if (gestionInventarioRef.current) {
            gestionInventarioRef.current.refrescar();
        }
        toast.success('¡Inventario generado exitosamente!');
    };

    /**
     * @description Callback que se ejecuta cuando se carga un inventario desde archivo exitosamente.
     * Cierra los modales pertinentes y refresca el panel de inventario.
     */
    const handleInventarioChange = () => {
        setIsGeneradorModalOpen(false);
        setIsCargarModalOpen(false);
        if (gestionInventarioRef.current) {
            gestionInventarioRef.current.refrescar();
        }
        toast.success('¡Inventario actualizado exitosamente!');
    };


    // --- RENDERIZADO --- //

    return (
        <>
            {/* Layout principal de la página, dividido en dos columnas en pantallas grandes. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Panel con la lista de tipos de recurso. */}
                <div className="lg:col-span-1">
                    <TiposRecursoPanel
                        tipos={tiposDeRecurso}
                        tipoSeleccionadoId={tipoSeleccionadoId}
                        onSelectTipo={setTipoSeleccionadoId}
                        onCrearTipo={() => setIsCreateModalOpen(true)}
                        isLoading={isLoadingTipos}
                    />
                </div>

                {/* Columna Derecha: Panel que muestra el inventario del tipo seleccionado. */}
                <div className="lg:col-span-2">
                    <GestionInventarioPanel
                        ref={gestionInventarioRef}
                        tipoSeleccionado={tipoSeleccionado}
                        onGenerarClick={() => setIsGeneradorModalOpen(true)}
                        onCargarClick={() => setIsCargarModalOpen(true)}
                    />
                </div>
            </div>

            {/* --- MODALES --- */}

            {/* Modal para la Creación de Nuevos Tipos de Recurso */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Añadir Nuevos Tipos de Recurso">
                <CrearTipoRecursoModal onClose={() => setIsCreateModalOpen(false)} onRecursosCreados={handleRecursosCreados} />
            </Modal>

            {/* 
              Los modales de generación y carga solo se renderizan si hay un tipo de recurso seleccionado,
              ya que dependen de los datos de `tipoSeleccionado` para funcionar.
            */}
            {tipoSeleccionado && (
                <>
                    {/* Modal para el Generador de Inventario Secuencial */}
                    <Modal
                        isOpen={isGeneradorModalOpen}
                        onClose={() => setIsGeneradorModalOpen(false)}
                        title="Generador de Inventario Secuencial"
                        maxWidthClass="max-w-2xl"
                    >
                        <GeneradorInventarioModal
                            onClose={() => setIsGeneradorModalOpen(false)}
                            onSuccess={handleInventarioGenerado}
                            tipoRecurso={tipoSeleccionado}
                        />
                    </Modal>

                    {/* Modal para Cargar Inventario desde Archivo */}
                    <Modal isOpen={isCargarModalOpen} onClose={() => setIsCargarModalOpen(false)} title={`Cargar Inventario para ${tipoSeleccionado.nombre}`}>
                        <CargarArchivoModal
                            onClose={() => setIsCargarModalOpen(false)}
                            onSuccess={handleInventarioChange}
                            tipoRecurso={tipoSeleccionado}
                        />
                    </Modal>
                </>
            )}
        </>
    );
};

export default RecursosPage;
