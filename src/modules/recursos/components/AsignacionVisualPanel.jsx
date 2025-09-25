import React, { useState, useEffect } from 'react';
import { useAsignacionVisual } from '../hooks/useAsignacionVisual.js';
import apiService from '../../../services/apiService.js';
import RecursoCard from './RecursoCard';
import AsignacionToolbar from './AsignacionToolbar';
import { STYLES } from '../../../utils/styleConstants.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import AsignacionSimpleModal from './AsignacionSimpleModal.jsx';
import SearchBar from '../../../components/ui/SearchBar.jsx';

const AsignacionVisualPanel = ({ tipoRecurso, onGoBack, onSuccess }) => {
    const {
        isLoading, items, modo, setModo,
        selectedIds, toggleSelection, handleAsignar, handleDesasignar,
        guardarCambios, descartarCambios, hayCambiosSinGuardar,
        sesionGuardadaDetectada,
        restaurarSesion,
        descartarSesionGuardada,
        activateSelection,
        deactivateSelection,
    } = useAsignacionVisual(tipoRecurso);

    const [unidades, setUnidades] = useState([]);
    const [itemParaAsignar, setItemParaAsignar] = useState(null);
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

    const handleModeChange = (newMode) => {
        if (modo !== newMode) {
            if (newMode === 'simple') {
                deactivateSelection();
            } else {
                activateSelection();
            }
            setModo(newMode);
        }
    };

    const handleSimpleAction = async (action, itemIds, unidad = null) => {
        let success = false;
        if (action === 'asignar') {
            success = await handleAsignar(itemIds, unidad);
        } else {
            success = await handleDesasignar(itemIds);
        }

        if (success) {
            setItemParaAsignar(null);
            if (onSuccess) onSuccess();
        }
    };

    const handleGuardadoExitoso = async () => {
        const success = await guardarCambios();
        if (success && onSuccess) {
            onSuccess();
        }
    };

    const handleAsignarMasivo = (unidadId) => {
        const unidad = unidades.find(u => u.id === unidadId);
        if (!unidad) return;
        handleAsignar(Array.from(selectedIds), unidad);
    };

    const handleSimpleClick = (item) => {
        setItemParaAsignar(item);
    };

    const itemsFiltrados = items.filter(item =>
        item.identificador_unico.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    if (isLoading) {
        return <p className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-400 p-8">Cargando inventario...</p>;
    }

    return (
        <>
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                {sesionGuardadaDetectada && (
                    <div className="bg-blue-900/50 border border-blue-700 p-3 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-blue-200 text-center sm:text-left">
                            <span className="font-semibold">¡Atención!</span> Detectamos cambios sin guardar de una sesión anterior.
                        </p>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={restaurarSesion} className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm">
                                Restaurar Trabajo
                            </button>
                            <button onClick={descartarSesionGuardada} className={`${STYLES.buttonLink} text-sm`}>
                                Descartar
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 flex-shrink-0">
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-white">Gestión de Asignaciones Visual</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {modo === 'simple' ? "Haz clic en un recurso para asignarlo o desasignarlo." : "Selecciona varios recursos para asignarlos en lote."}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                            <button onClick={() => handleModeChange('simple')} className={`px-3 py-1 text-sm rounded-md ${modo === 'simple' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}>Simple</button>
                            <button onClick={() => handleModeChange('masivo')} className={`px-3 py-1 text-sm rounded-md ${modo === 'masivo' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}>Masivo</button>
                        </div>
                        <button onClick={onGoBack} className={STYLES.buttonLink}>Volver a Tabla</button>
                    </div>
                </div>
                <SearchBar
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    placeholder='Buscar por identificador...'
                    className='flex-shrink-0'
                />
                <div className="flex-grow overflow-y-auto p-4 -mr-2 ">
                    {itemsFiltrados.length > 0 ? (
                        // <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {itemsFiltrados.map(item => (
                                <RecursoCard
                                    key={item.id}
                                    item={item}
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
                <div className="flex-shrink-0 pt-2  mt-auto ">
                    {modo === 'masivo' && selectedIds.size > 0 && (
                        <AsignacionToolbar
                            selectedCount={selectedIds.size}
                            unidades={unidades}
                            onAsignar={handleAsignarMasivo}
                            onDesasignar={() => handleDesasignar(Array.from(selectedIds))}
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
                        onAsignar={(itemIds, unidad) => handleSimpleAction('asignar', itemIds, unidad)}
                        onDesasignar={(itemIds) => handleSimpleAction('desasignar', itemIds)}
                        onClose={() => setItemParaAsignar(null)}
                    />
                )}
            </Modal>
        </>
    );
};

export default AsignacionVisualPanel;