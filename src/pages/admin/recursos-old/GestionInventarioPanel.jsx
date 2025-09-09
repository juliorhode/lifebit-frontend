import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiCpu, FiUpload, FiEye } from 'react-icons/fi'; // Añadimos un icono para la gestión visual

/**
 * @description Panel para gestionar el inventario de un tipo de recurso específico.
 * Es responsable de obtener y mostrar el inventario actual, y de proveer
 * las acciones para añadir nuevo inventario o gestionar las asignaciones.
 *
 * @param {object} props
 * @param {object|null} props.tipoSeleccionado - El objeto del tipo de recurso seleccionado.
 *                                                Si es null, el panel muestra un estado de bienvenida.
 * @param {function} props.onGenerarClick - Callback a llamar cuando se pulsa 'Generar Inventario'.
 * @param {function} props.onCargarClick - Callback a llamar cuando se pulsa 'Cargar desde Archivo'.
 * @param {function} props.onAsignarClick - Callback a llamar cuando se pulsa 'Gestionar Asignaciones'.
 */
const GestionInventarioPanel = ({ tipoSeleccionado, onGenerarClick, onCargarClick, onAsignarClick }) => {
    // --- ESTADO INTERNO DEL PANEL ---

    // `inventario`: Almacena la lista de instancias de recursos (ej. todos los estacionamientos).
    const [inventario, setInventario] = useState([]);
    // `isLoading`: Controla el estado de carga para ESTE panel.
    const [isLoading, setIsLoading] = useState(false);
    // `error`: Almacena cualquier mensaje de error que ocurra al cargar el inventario.
    const [error, setError] = useState('');

    // --- LÓGICA DE DATOS (EFECTOS) ---

    /**
     * Este `useEffect` es el motor reactivo del panel. Se dispara cada vez que el
     * `tipoSeleccionado` (recibido como prop) cambia. Su trabajo es ir a la API
     * y cargar el inventario correspondiente al nuevo tipo seleccionado.
     */
    useEffect(() => {
        // Extraemos el ID, que es un valor primitivo (número).
        const tipoId = tipoSeleccionado?.id;

        if (!tipoId) {
            setInventario([]);
            setError('');
            return;
        }

        const fetchInventario = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Usamos el ID para la llamada a la API.
                const response = await apiService.get(`/admin/recursos/por-tipo/${tipoId}`);
                setInventario(response.data.data.recursos);
            } catch (err) {
                console.error(`Error al obtener inventario para el recurso ${tipoId}:`, err);
                setError('No se pudo cargar el inventario.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventario();
    }, [tipoSeleccionado?.id]);

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

    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            {/* Cabecera dinámica que muestra el nombre del recurso que se está gestionando */}
            <h2 className={STYLES.titleSection}>Inventario de: <span className="text-blue-400">{tipoSeleccionado.nombre}</span></h2>

            {/* Botones de Acción para AÑADIR nuevo inventario */}
            <div className="flex flex-col sm:flex-row gap-4 my-6">
                <button onClick={onGenerarClick} className={`${STYLES.buttonPrimary} w-full sm:w-auto flex-1`}>
                    <FiCpu className="mr-2" />
                    Generar Secuencialmente
                </button>
                <button onClick={onCargarClick} className={`${STYLES.buttonPrimaryAuto} w-full sm:w-auto flex-1`}>
                    <FiUpload className="mr-2" />
                    Cargar desde Archivo
                </button>
            </div>

            {/* Tabla de Inventario Existente */}
            {/* 
              - `flex-grow`: Este div padre ocupa todo el espacio vertical sobrante.
              - `flex flex-col`: Apila sus hijos (título y contenedor de la tabla) verticalmente.
              - `overflow-y-hidden`: CRUCIAL. Previene que este contenedor tenga scroll.
            */}
            <div className="border-t border-gray-700 pt-4 flex-grow flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-white">Inventario Actual ({inventario.length})</h3>
                    {inventario.length > 0 && (
                        <button onClick={onAsignarClick} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                            <FiEye /> Gestionar Asignaciones
                        </button>
                    )}
                </div>
             
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <p className="text-gray-400">Cargando inventario...</p> // TODO: Usar un esqueleto de tabla
                    ) : error ? (
                        <p className={STYLES.errorText}>{error}</p>
                    ) : (
                        inventario.length > 0
                                    ? (
                                        <div className="overflow-x-auto"> 
                                            <table className="w-full text-left text-sm text-gray-300 table-fixed">
                                    <thead className="border-b border-gray-700">
                                        <tr>
                                            <th className="py-2">Identificador</th>
                                            <th className="py-2">Propietario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventario.map(item => (
                                            <tr key={item.id} className="border-b border-gray-800">
                                                <td className="py-2 font-mono">{item.identificador_unico}</td>
                                                <td className="py-2">{item.propietario_nombre || <span className="text-gray-500">Sin Asignar</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                        </div>
                            )
                            : (
                                <p className="text-gray-400 text-center py-8">
                                    Aún no hay inventario para este tipo de recurso.
                                </p>
                            )
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionInventarioPanel;