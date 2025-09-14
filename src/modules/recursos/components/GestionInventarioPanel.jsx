import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiCpu, FiUpload, FiEye } from 'react-icons/fi';
import AsignacionVisualPanel from './AsignacionVisualPanel';
import SearchBar from '../../../components/ui/SearchBar';

const GestionInventarioPanel = forwardRef(({ tipoSeleccionado, onGenerarClick, onCargarClick, onInventarioChange }, ref) => {
    const [inventario, setInventario] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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

    if (vistaActual === 'visual') {
        return (
            <AsignacionVisualPanel
                tipoRecurso={tipoSeleccionado}
                onGoBack={() => setVistaActual('tabla')}
                onSuccess={onInventarioChange}
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

            <div className="border-t border-gray-700 pt-4 flex-grow flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-white">Inventario Actual ({inventarioFiltrado.length})</h3>
                    {inventarioFiltrado.length > 0 && (
                        <button onClick={() => setVistaActual('visual')} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                            <FiEye /> Gestionar Asignaciones
                        </button>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-gray-400">Cargando inventario...</p>
                        ) : error ? (
                            <p className={STYLES.errorText}>{error}</p>
                        ) : inventario.length > 0 ? (
                            inventarioFiltrado.length > 0 ? (
                                <table className="w-full text-left text-sm text-gray-300 table-fixed">
                                    <colgroup><col className="w-2/3" /><col className="w-1/3" /></colgroup>
                                    <thead className="border-b border-gray-700">
                                        <tr>
                                            <th className="py-2 px-2">Identificador</th>
                                            <th className="py-2 px-2">Propietario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventarioFiltrado.map(item => (
                                            <tr key={item.id} className="border-b border-gray-800">
                                                <td className="py-2 px-2 font-mono truncate">{item.identificador_unico}</td>
                                                <td className="py-2 px-2 truncate">{item.nombre_unidad_propietaria || <span className="text-gray-500">Sin Asignar</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No se encontraron resultados para "{terminoBusqueda}".</p>
                            )
                        ) : (
                            <p className="text-gray-400 text-center py-8">Aún no hay inventario para este tipo de recurso.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default GestionInventarioPanel;