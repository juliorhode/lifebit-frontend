import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiCpu, FiUpload } from 'react-icons/fi';

/**
 * @description Panel para gestionar el inventario de un tipo de recurso específico.
 * Es responsable de obtener y mostrar el inventario actual, y de proveer
 * las acciones para añadir nuevo inventario.
 *
 * @param {object} props
 * @param {object|null} props.tipoSeleccionado - El objeto del tipo de recurso seleccionado.
 *                                                Si es null, el panel muestra un estado de bienvenida.
 */
const GestionInventarioPanel = ({ tipoSeleccionado }) => {
    // --- ESTADO INTERNO DEL PANEL ---

    // `inventario`: Almacena la lista de instancias de recursos (ej. todos los estacionamientos).
    const [inventario, setInventario] = useState([]);
    // `isLoading`: Controla el estado de carga para ESTE panel. Permite mostrar un esqueleto
    //              sin bloquear el panel izquierdo.
    const [isLoading, setIsLoading] = useState(false);
    // `error`: Almacena cualquier mensaje de error que ocurra al cargar el inventario.
    const [error, setError] = useState('');

    // --- LÓGICA DE DATOS (EFECTOS) ---

    /**
     * `useEffect` es el hook de React para manejar "efectos secundarios".
     * Una llamada a una API es un efecto secundario.
     * Este efecto se ejecuta cada vez que el valor de `tipoSeleccionado` cambia.
     */
    useEffect(() => {
        // Si no hay ningún tipo seleccionado, reseteamos el panel a su estado inicial.
        if (!tipoSeleccionado) {
            setInventario([]);
            setError('');
            return; // Detenemos la ejecución del efecto aquí.
        }

        // Definimos la función asíncrona para obtener los datos.
        const fetchInventario = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Hacemos la llamada a la API usando el ID del tipo seleccionado.
                const response = await apiService.get(`/admin/recursos/por-tipo/${tipoSeleccionado.id}`);
                // Guardamos los datos recibidos en nuestro estado.
                setInventario(response.data.data.recursos);
            } catch (err) {
                console.error(`Error al obtener el inventario para el recurso ${tipoSeleccionado.id}:`, err);
                setError('No se pudo cargar el inventario. Inténtalo de nuevo más tarde.');
            } finally {
                // Pase lo que pase (éxito o error), nos aseguramos de desactivar el estado de carga.
                setIsLoading(false);
            }
        };

        fetchInventario();
    }, [tipoSeleccionado]); // La dependencia `[tipoSeleccionado]` es la clave.
    // React re-ejecutará este efecto si y solo si este objeto cambia.

    // --- RENDERIZADO DEL COMPONENTE ---

    // Si no hay tipo seleccionado, mostramos una pantalla de bienvenida.
    if (!tipoSeleccionado) {
        return (
            <div className={`${STYLES.card} h-full flex items-center justify-center text-center`}>
                <div className="text-gray-500">
                    <h2 className="text-xl font-semibold">Panel de Gestión de Inventario</h2>
                    <p className="mt-1">← Selecciona un tipo de recurso para comenzar.</p>
                </div>
            </div>
        );
    }

    // Si hay un tipo seleccionado, mostramos el panel de gestión completo.
    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            {/* Cabecera dinámica que muestra el nombre del recurso seleccionado */}
            <h2 className={STYLES.titleSection}>Inventario de: <span className="text-blue-400">{tipoSeleccionado.nombre}</span></h2>

            {/* Botones de Acción Principal */}
            <div className="flex flex-col sm:flex-row gap-4 my-6">
                <button className={`${STYLES.buttonPrimary} w-full sm:w-auto flex-1`}>
                    <FiCpu className="mr-2" />
                    Generar Inventario Secuencial
                </button>
                <button className={`${STYLES.buttonSecondary} w-full sm:w-auto flex-1`}>
                    <FiUpload className="mr-2" />
                    Cargar desde Archivo
                </button>
            </div>

            {/* Tabla de Inventario Existente */}
            <div className="border-t border-gray-700 pt-4 flex-grow overflow-y-auto">
                <h3 className="font-semibold text-white mb-2">Inventario Actual ({inventario.length})</h3>
                <div className="pr-2 -mr-2"> {/* Truco para ocultar la barra de scroll visualmente */}
                    {isLoading ? (
                        <p className="text-gray-400">Cargando inventario...</p> // TODO: Usar un esqueleto de tabla
                    ) : error ? (
                        <p className={STYLES.errorText}>{error}</p>
                    ) : (
                        inventario.length > 0
                            ? (
                                <p className="text-gray-400">
                                    Tabla de inventario irá aquí. {inventario.length} items encontrados.
                                </p>
                                // TODO: Reemplazar este <p> con un componente de tabla real
                            )
                            : (
                                <p className="text-gray-400">
                                    Aún no hay inventario para este tipo de recurso. ¡Usa las herramientas de arriba para añadirlo!
                                </p>
                            )
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionInventarioPanel;