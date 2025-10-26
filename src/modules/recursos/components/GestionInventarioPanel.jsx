import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiCpu, FiUpload, FiEye } from 'react-icons/fi';
import AsignacionVisualPanel from './AsignacionVisualPanel';
import SearchBar from '../../../components/ui/SearchBar';
import GestionInventarioVisual from './GestionInventarioVisual';

const GestionInventarioPanel = forwardRef(({ tipoSeleccionado, onGenerarClick, onCargarClick, onInventarioChange, listaUbicaciones }, ref) => {
    const [inventario, setInventario] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // El estado `vistaActual` puede tener valores: 'tabla', 'asignacion_visual', 'inventario_visual'.
    const [vistaActual, setVistaActual] = useState('tabla');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');


    const fetchInventario = async () => {
        if (!tipoSeleccionado?.id) {
            setInventario([]);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await apiService.get(`/admin/recursos/por-tipo/${tipoSeleccionado.id}`);
            const inventarioOrdenado = response.data.data.recursos.sort((a, b) =>
                a.identificador_unico.localeCompare(b.identificador_unico, undefined, { numeric: true, sensitivity: 'base' })
            );
            setInventario(inventarioOrdenado);
        } catch (err) {
            setError('No se pudo cargar el inventario.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setVistaActual('tabla');
        setTerminoBusqueda('');
        fetchInventario();
    }, [tipoSeleccionado?.id]);

    useImperativeHandle(ref, () => ({
        refrescar: fetchInventario
    }));

    const inventarioFiltrado = inventario.filter(item =>
        item.identificador_unico.toLowerCase().includes(terminoBusqueda.toLowerCase())

    );

    /**
     * @description Lógica de bifurcación. Decide qué panel de gestión visual mostrar
     * basándose en el 'tipo' del recurso seleccionado.
     */
    const handleGestionarClick = () => {
        if (tipoSeleccionado.tipo === 'asignable') {
            setVistaActual('asignacion_visual');
        } else { // Si es 'inventario'
            setVistaActual('inventario_visual');
        }
    };

    if (!tipoSeleccionado) {
        return (
            <div className={`${STYLES.card} h-full flex items-center justify-center text-center`}>
                <div className="text-gray-600 dark:text-gray-500">
                    <h2 className="text-xl font-semibold">Panel de Gestión de Inventario</h2>
                    <p className="mt-1">← Selecciona un tipo de recurso para comenzar.</p>
                </div>
            </div>
        );
    }

    // Si la vista es 'asignacion_visual', renderiza el panel antiguo.
    if (vistaActual === 'asignacion_visual') {
        return (
            <AsignacionVisualPanel
                tipoRecurso={tipoSeleccionado}
                onGoBack={() => setVistaActual('tabla')}
                onSuccess={onInventarioChange}
            />
        );
    }
    // Si la vista es 'inventario_visual', renderiza nuestro nuevo panel.
    if (vistaActual === 'inventario_visual') {
        return (
            <GestionInventarioVisual
                tipoRecurso={tipoSeleccionado}
                onGoBack={() => setVistaActual('tabla')}
                onSuccess={onInventarioChange} // onSuccess puede ser reutilizado para refrescar la tabla.
                listaUbicaciones={listaUbicaciones}
            />
        );
    }

    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            <h2 className={STYLES.titleSection}>Inventario de: <span className="text-blue-400">{tipoSeleccionado.nombre}</span></h2>

            <SearchBar
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar por identificador..."
                className="my-4"
            />

            {/* <div className="flex flex-col sm:flex-row gap-4 my-6">
                <button onClick={onGenerarClick} className={`${STYLES.buttonPrimary} w-full sm:w-auto flex-1`}>
                    <FiCpu className="mr-2" />
                    Generar Secuencialmente
                </button>
                <button onClick={onCargarClick} className={`${STYLES.buttonPrimaryAuto} w-full sm:w-auto flex-1`}>
                    <FiUpload className="mr-2" />
                    Cargar desde Archivo
                </button>
            </div> */}
            {/* Los botones de 'Generar' y 'Cargar' se muestran si el tipo es 'asignable' */}
            {tipoSeleccionado.tipo === 'asignable' && (
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
            )}
            {/* Los botones de 'Generar' se muestra si el tipo es 'inventario' */}
            {tipoSeleccionado.tipo === 'inventario' && (
                <div className="flex flex-col sm:flex-row my-2">
                    <button onClick={onGenerarClick} className={`${STYLES.buttonPrimary} w-full sm:w-auto flex-1`}>
                        <FiCpu className="mr-2" />
                        Generar Secuencialmente
                    </button>
                </div>
            )}


            <div className="border-t border-gray-300 dark:border-gray-700 pt-4 flex-grow flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-gray-700 dark:text-white">Inventario Actual ({inventarioFiltrado.length})</h3>
                    {inventarioFiltrado.length > 0 && (
                        <button onClick={handleGestionarClick} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                            <FiEye /> Gestionar Asignaciones
                        </button>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-gray-600 dark:text-gray-400">Cargando inventario...</p>
                        ) : error ? (
                            <p className={STYLES.errorText}>{error}</p>
                        ) : inventario.length > 0 ? (
                            inventarioFiltrado.length > 0 ? (
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 table-fixed">
                                    <colgroup><col className="w-2/3" /><col className="w-1/3" /></colgroup>
                                    <thead className="border-b border-gray-300 dark:border-gray-700">
                                        <tr>
                                            <th className="py-2 px-2">Identificador</th>
                                            <th className="py-2 px-2">{tipoSeleccionado.tipo === 'inventario' ? 'Ubicación' : 'Propietario'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventarioFiltrado.map(item => (
                                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                                                <td className="py-2 px-2 font-mono truncate">{item.identificador_unico}</td>
                                                <td className="py-2 px-2 truncate">{item.nombre_unidad_propietaria || item.ubicacion || <span className="text-gray-500">Sin Asignar</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No se encontraron resultados para "{terminoBusqueda}".</p>
                            )
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-8">Aún no hay inventario para este tipo de recurso.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default GestionInventarioPanel;
