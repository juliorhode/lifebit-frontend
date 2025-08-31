import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import TiposRecursoPanel from './TiposRecursoPanel';
import GestionInventarioPanel from './GestionInventarioPanel';
import Modal from '../../../components/ui/Modal';
import CrearTipoRecursoModal from './CrearTipoRecursoModal';
/* 
Lógica de Estado:
tiposDeRecurso: Un array que contendrá la lista de tipos de recurso, obtenida de la API.
tipoSeleccionadoId: El ID del tipo de recurso que el usuario ha seleccionado.
isLoading: Un booleano para manejar el estado de carga inicial.
isCreateModalOpen: Un booleano para controlar la visibilidad de nuestro CrearTipoRecursoModal.

Flujo de Datos:
Al cargar la página, un useEffect hará una llamada GET /api/admin/recursos/tipos para obtener la lista inicial.
Pasaremos esta lista y los estados relevantes como props a TiposRecursoPanel.
Cuando el usuario haga clic en "+ Añadir Tipo", cambiaremos isCreateModalOpen a true.
Cuando el modal nos notifique que ha terminado (onRecursosCreados), volveremos a llamar a la API para refrescar la lista.
*/

/**
 * @description Página principal para la gestión de Recursos.
 * Actúa como el "orquestador" o "cerebro" de este módulo. Su principal
 * responsabilidad es manejar el estado de alto nivel y facilitar la
 * comunicación entre sus componentes hijos (los paneles y los modales).
 *
 * Arquitectura:
 * 1. Carga la lista completa de "Tipos de Recurso" al montarse.
 * 2. Mantiene en su estado cuál es el "Tipo" que el usuario ha seleccionado.
 * 3. Gestiona la visibilidad del modal de creación de nuevos tipos.
 * 4. Pasa los datos y las funciones necesarias (`props`) a los componentes hijos,
 *    permitiendo que ellos se mantengan como componentes "controlados" y más simples.
 */
const RecursosPage = () => {
    // --- ESTADO PRINCIPAL DE LA PÁGINA ---

    // `tiposDeRecurso`: Almacena la lista de todas las categorías de recursos del edificio.
    // Es la fuente de verdad para el panel izquierdo.
    const [tiposDeRecurso, setTiposDeRecurso] = useState([]);

    // `tipoSeleccionadoId`: Almacena el ID del tipo de recurso que el usuario ha seleccionado.
    // Este estado es crucial porque "controla" lo que muestra el panel derecho.
    const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);

    // `isLoadingTipos`: Controla el estado de carga (UI Esqueleto) del panel izquierdo.
    // Es importante tener un estado de carga separado para este panel.
    const [isLoadingTipos, setIsLoadingTipos] = useState(true);

    // `isCreateModalOpen`: Un simple booleano para abrir o cerrar el modal de creación.
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- LÓGICA DE DATOS (EFECTOS) ---

    /**
     * @description Función para obtener (o refrescar) la lista de tipos de recurso desde la API.
     * Se encapsula en una función para poder reutilizarla (en la carga inicial y después de crear nuevos tipos).
     */
    const fetchTiposDeRecurso = async () => {
        setIsLoadingTipos(true);
        try {
            const response = await apiService.get('/admin/recursos/tipos');
            setTiposDeRecurso(response.data.data.tiposRecurso);
        } catch (error) {
            console.error("Error al obtener los tipos de recurso:", error);
            // TODO: Implementar un sistema de notificaciones de error para el usuario.
        } finally {
            setIsLoadingTipos(false);
        }
    };

    // `useEffect` para la carga inicial de datos.
    // El array de dependencias vacío `[]` es una instrucción a React para que
    // ejecute esta función UNA SOLA VEZ, justo después de que el componente se monte por primera vez.
    useEffect(() => {
        fetchTiposDeRecurso();
    }, []);

    // --- MANEJADORES DE EVENTOS (CALLBACKS) ---

    /**
     * @description Callback que se ejecuta cuando el modal de creación de tipos ha finalizado su trabajo.
     * Este es un ejemplo de comunicación de "hijo a padre".
     */
    const handleRecursosCreados = () => {
        setIsCreateModalOpen(false); // Cierra el modal.
        fetchTiposDeRecurso();     // Dispara la actualización de la lista en el panel izquierdo.
    };

    // Para pasar al panel derecho, no solo pasamos el ID, sino el objeto completo.
    // Esto evita que el panel derecho tenga que buscarlo en la lista. Es más eficiente.
    const tipoSeleccionado = tiposDeRecurso.find(t => t.id === tipoSeleccionadoId) || null;

    return (
        <>
            {/* 
                Layout de la página:
                - En móvil (por defecto): una sola columna (grid-cols-1), los paneles se apilan.
                - En pantallas grandes (lg y superior): una cuadrícula de 3 columnas (grid-cols-3).
                - `h-[calc(100vh-120px)]`: Un truco de CSS para que el contenedor ocupe casi toda la altura
                  de la pantalla, restando la altura aproximada del Header, para que el scroll interno funcione bien.
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                {/* --- COLUMNA IZQUIERDA: Panel de Tipos --- */}
                <div className="lg:col-span-1 h-full">
                    <TiposRecursoPanel
                        tipos={tiposDeRecurso}
                        tipoSeleccionadoId={tipoSeleccionadoId}
                        onSelectTipo={setTipoSeleccionadoId}
                        onCrearTipo={() => setIsCreateModalOpen(true)}
                        isLoading={isLoadingTipos}
                    />
                </div>

                {/* --- COLUMNA DERECHA: Panel de Gestión de Inventario --- */}
                <div className="lg:col-span-2 h-full">
                    <GestionInventarioPanel tipoSeleccionado={tipoSeleccionado} />
                </div>
            </div>

            {/* --- MODAL PARA CREAR NUEVOS TIPOS --- */}
            {/* Este modal vive fuera del layout principal para poder superponerse a todo. */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Añadir Nuevos Tipos de Recurso"
            >
                <CrearTipoRecursoModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onRecursosCreados={handleRecursosCreados}
                />
            </Modal>
        </>
    );
};

export default RecursosPage;