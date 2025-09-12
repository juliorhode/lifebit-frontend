import React, { useState, useEffect } from 'react';
import { useAsignacionVisual } from '../hooks/useAsignacionVisual.js';
import apiService from '../../../services/apiService.js';
import RecursoCard from './RecursoCard';
import AsignacionToolbar from './AsignacionToolbar';
import { STYLES } from '../../../utils/styleConstants.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import AsignacionSimpleModal from './AsignacionSimpleModal.jsx';
import { FiSearch } from 'react-icons/fi';
import SearchBar from '../../../components/ui/SearchBar.jsx';

/**
 * @description Componente principal que orquesta la interfaz de asignación visual de recursos.
 * Utiliza el hook `useAsignacionVisual` para toda la lógica de estado y delegando la renderización
 * a componentes hijos como `RecursoCard`, `AsignacionToolbar` y `AsignacionSimpleModal`.
 * @param {object} props
 * @param {object} props.tipoRecurso - El tipo de recurso seleccionado sobre el cual se trabajará.
 * @param {function} props.onGoBack - Callback para volver a la vista de tabla.
 * @param {function} props.onSuccess - Callback que se ejecuta después de guardar cambios exitosamente, para notificar al componente padre.
 */
const AsignacionVisualPanel = ({ tipoRecurso, onGoBack, onSuccess }) => {
    const {
        isLoading, items, modo, setModo,
        selectedIds, toggleSelection, handleAsignar, handleDesasignar,
        guardarCambios, descartarCambios, hayCambiosSinGuardar, clearSelection,
    } = useAsignacionVisual(tipoRecurso);

    const [unidades, setUnidades] = useState([]);
    const [itemParaAsignar, setItemParaAsignar] = useState(null);
    /** @type {[string, function]} terminoBusqueda - Almacena el texto actual del campo de búsqueda para filtrar los items. */
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await apiService.get('/admin/unidades');
                setUnidades(response.data.data.unidades);
            } catch (error) { console.error("Error al cargar unidades:", error); }
        };
        fetchUnidades();
    }, []);

    const handleAsignarMasivo = (unidadId) => {
        const unidad = unidades.find(u => u.id === unidadId);
        if (!unidad) return;
        handleAsignar(Array.from(selectedIds), unidad);
    };

    const handleCancelarMasivo = () => {
        clearSelection();
    };

    const handleSimpleClick = (item) => {
        setItemParaAsignar(item);
    };

    const handleGuardadoExitoso = () => {
        guardarCambios().then(() => {
            onSuccess();
        });
    };

    // Filtra los items basado en el término de búsqueda para facilitar la localización.
    const itemsFiltrados = items.filter(item =>
        item.identificador_unico.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    if (isLoading) {
        return <p className="text-center text-gray-400 p-8">Cargando inventario...</p>;
    }

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 flex-shrink-0">
                    <div>
                        <h3 className="font-semibold text-white">Gestión de Asignaciones Visual</h3>
                        <p className="text-sm text-gray-400">
                            {modo === 'simple' ? "Haz clic en un recurso para asignarlo o desasignarlo." : "Selecciona varios recursos para asignarlos en lote."}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="flex items-center bg-gray-900 rounded-lg p-1">
                            <button onClick={() => setModo('simple')} className={`px-3 py-1 text-sm rounded-md ${modo === 'simple' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Simple</button>
                            <button onClick={() => setModo('masivo')} className={`px-3 py-1 text-sm rounded-md ${modo === 'masivo' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Masivo</button>
                        </div>
                        <button onClick={onGoBack} className={STYLES.buttonLink}>Volver a Tabla</button>
                    </div>
                </div>

                {/* Barra de Búsqueda */}
                <SearchBar
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)} // Actualiza el estado del término de búsqueda
                    placeholder='Buscar por identificador...' // Texto del placeholder
                />

                <div className="flex-grow overflow-y-auto pr-2 -mr-2 mt-4">
                    {itemsFiltrados.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-2">
                            {itemsFiltrados.map(item => (
                                <RecursoCard
                                    key={item.id}
                                    item={item}
                                    modo={modo}
                                    onClick={modo === 'masivo' ? toggleSelection : handleSimpleClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No se encontraron resultados para "{terminoBusqueda}".</p>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-700">
                    {modo === 'masivo' && selectedIds.size > 0 && (
                        <AsignacionToolbar
                            selectedCount={selectedIds.size}
                            unidades={unidades}
                            onAsignar={handleAsignarMasivo}
                            onDesasignar={() => handleDesasignar(Array.from(selectedIds))}
                            onCancel={handleCancelarMasivo}
                        />
                    )}
                    {hayCambiosSinGuardar && (
                        <div className={`flex justify-end gap-4 ${selectedIds.size > 0 ? 'mt-4' : ''}`}>
                            <button onClick={descartarCambios} className={STYLES.buttonSecondary}>Descartar Cambios</button>
                            <button onClick={handleGuardadoExitoso} className={STYLES.buttonPrimaryAuto}>Guardar Cambios</button>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={!!itemParaAsignar}
                onClose={() => setItemParaAsignar(null)}
                title="Gestionar Asignación"
            >
                {itemParaAsignar && (
                    <AsignacionSimpleModal
                        item={itemParaAsignar}
                        unidades={unidades}
                        onAsignar={handleAsignar}
                        onDesasignar={handleDesasignar}
                        onClose={() => setItemParaAsignar(null)}
                    />
                )}
            </Modal>
        </>
    );
};

export default AsignacionVisualPanel;
