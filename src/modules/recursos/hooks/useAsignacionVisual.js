import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useAsignacionVisual = (tipoRecurso) => {
	const [isLoading, setIsLoading] = useState(false);
	const [originalItems, setOriginalItems] = useState([]);
	const [workingItems, setWorkingItems] = useState([]);
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [modo, setModo] = useState('simple');
    const [sesionGuardadaDetectada, setSesionGuardadaDetectada] = useState(false);
    const [selectionMemory, setSelectionMemory] = useState(null);

    const localStorageKey = useMemo(() => 
        tipoRecurso ? `lifebit-unsaved-asignaciones-${tipoRecurso.id}` : null
    , [tipoRecurso]);

    const saveSessionToLS = useCallback((sessionData) => {
        if (localStorageKey) {
            const hayCambiosEnItems = JSON.stringify(sessionData.items) !== JSON.stringify(originalItems);
            const haySeleccionActiva = sessionData.selected && sessionData.selected.length > 0;
            const haySeleccionEnMemoria = sessionData.memory && sessionData.memory.length > 0;

            if (hayCambiosEnItems || haySeleccionActiva || haySeleccionEnMemoria) {
                localStorage.setItem(localStorageKey, JSON.stringify(sessionData));
            } else {
                localStorage.removeItem(localStorageKey);
            }
        }
    }, [localStorageKey, originalItems]);

	const fetchInventario = useCallback(async () => {
		const tipoId = tipoRecurso?.id;
        if (!tipoId) return;

		setIsLoading(true);
		try {
            const sesionGuardadaJSON = localStorage.getItem(localStorageKey);
            const response = await apiService.get(`/admin/recursos/por-tipo/${tipoId}`);
            const itemsDesdeAPI = response.data.data.recursos
    .map((item) => ({
     id: item.id,
     identificador_unico: item.identificador_unico,
     propietario_id: item.id_unidad,
     propietario_nombre: item.nombre_unidad_propietaria,
     estado: item.nombre_unidad_propietaria ? 'ocupado' : 'disponible',
     tipo_recurso: item.tipo_recurso,
    }))
				.sort((a, b) =>
					a.identificador_unico.localeCompare(b.identificador_unico, undefined, {
						numeric: true,
						sensitivity: 'base',
					})
				);
            
            setOriginalItems(itemsDesdeAPI);

            if (sesionGuardadaJSON) {
                const sesionGuardada = JSON.parse(sesionGuardadaJSON);
                setWorkingItems(sesionGuardada.items);
                const restoredSelectedIds = new Set(sesionGuardada.selected);
                setSelectedIds(restoredSelectedIds);
                if (sesionGuardada.memory) { setSelectionMemory(new Set(sesionGuardada.memory)); }
                setSesionGuardadaDetectada(true);

                if (restoredSelectedIds.size > 0 || (sesionGuardada.memory && sesionGuardada.memory.length > 0)) {
                    setModo('masivo');
                }
            } else {
                setWorkingItems(itemsDesdeAPI);
                setSelectedIds(new Set());
                setSelectionMemory(null);
            }
		} catch (err) {
			toast.error('No se pudo cargar el inventario.');
            setOriginalItems([]);
            setWorkingItems([]);
		} finally {
			setIsLoading(false);
		}
	}, [tipoRecurso?.id, localStorageKey]);

	useEffect(() => {
        setOriginalItems([]); setWorkingItems([]); setSelectedIds(new Set());
        setSelectionMemory(null); setSesionGuardadaDetectada(false);
		fetchInventario();
	}, [fetchInventario]);

	const toggleSelection = (itemToToggle) => {
		const newSelectedIds = new Set(selectedIds);
		if (newSelectedIds.has(itemToToggle.id)) { newSelectedIds.delete(itemToToggle.id); } 
        else { newSelectedIds.add(itemToToggle.id); }
		
		setWorkingItems((prev) => {
            const nuevosItems = prev.map((item) => {
				if (item.id === itemToToggle.id) {
					const originalState = originalItems.find(o => o.id === item.id)?.estado || 'disponible';
					return { ...item, estado: newSelectedIds.has(item.id) ? 'seleccionado' : originalState };
				}
				return item;
			});
            saveSessionToLS({ items: nuevosItems, selected: Array.from(newSelectedIds), memory: selectionMemory ? Array.from(selectionMemory) : null });
            return nuevosItems;
        });
        setSelectedIds(newSelectedIds);
	};
    
    const deactivateSelection = () => {
        const itemsSinSeleccion = workingItems.map(item => {
            if (selectedIds.has(item.id)) {
                const originalState = originalItems.find(o => o.id === item.id)?.estado || 'disponible';
                return {...item, estado: originalState};
            }
            return item;
        });
        setWorkingItems(itemsSinSeleccion);
        setSelectionMemory(selectedIds);
        setSelectedIds(new Set());
        saveSessionToLS({ items: itemsSinSeleccion, selected: [], memory: Array.from(selectedIds) });
    };

    const activateSelection = () => {
        const memory = selectionMemory || selectedIds;
        if (memory && memory.size > 0) {
            const itemsConSeleccionRestaurada = workingItems.map(item => {
                if(memory.has(item.id)) { return {...item, estado: 'seleccionado'}; }
                return item;
            });
            setWorkingItems(itemsConSeleccionRestaurada);
            setSelectedIds(memory);
            setSelectionMemory(null);
            saveSessionToLS({ items: itemsConSeleccionRestaurada, selected: Array.from(memory), memory: null });
        }
    };
    
	const handleAsignar = async (itemIds, unidad) => {
        if (modo === 'simple') {
            const toastId = toast.loading('Asignando recurso...');
            try {
                const asignaciones = itemIds.map(id => ({ idRecurso: id, idUnidad: unidad.id }));
                await apiService.patch('/admin/recursos/asignaciones', { asignaciones });
                toast.success('Recurso asignado con éxito', { id: toastId });
                await fetchInventario();
                return true;
            } catch (error) {
                toast.error('Error al asignar el recurso.', { id: toastId });
                return false;
            }
        } else {
            setWorkingItems((prev) => {
                const nuevosItems = prev.map((item) => {
                    if (itemIds.includes(item.id)) {
                        return { ...item, estado: 'ocupado', propietario_id: unidad.id, propietario_nombre: unidad.numero_unidad };
                    }
                    return item;
                });
                saveSessionToLS({ items: nuevosItems, selected: [], memory: null });
                return nuevosItems;
            });
            setSelectedIds(new Set());
            setSelectionMemory(null);
        }
	};

	const handleDesasignar = async (itemIds) => {
        if (modo === 'simple') {
            const toastId = toast.loading('Desasignando recurso...');
            try {
                const asignaciones = itemIds.map(id => ({ idRecurso: id, idUnidad: null }));
                await apiService.patch('/admin/recursos/asignaciones', { asignaciones });
                toast.success('Recurso desasignado con éxito', { id: toastId });
                await fetchInventario();
                return true;
            } catch (error) {
                toast.error('Error al desasignar el recurso.', { id: toastId });
                return false;
            }
        } else {
            setWorkingItems((prev) => {
                const nuevosItems = prev.map((item) => {
                    if (itemIds.includes(item.id)) {
                        return { ...item, estado: 'disponible', propietario_id: null, propietario_nombre: null };
                    }
                    return item;
                });
                saveSessionToLS({ items: nuevosItems, selected: [], memory: null });
                return nuevosItems;
            });
            setSelectedIds(new Set());
            setSelectionMemory(null);
        }
	};

    const descartarCambios = () => {
        if (localStorageKey) {
            localStorage.removeItem(localStorageKey);
        }
        setWorkingItems(JSON.parse(JSON.stringify(originalItems)));
        setSelectedIds(new Set());
        setSelectionMemory(null);
		toast.info('Cambios descartados.');
	};

	const guardarCambios = async () => {
        const cambios = workingItems.filter((item) => {
            const originalItem = originalItems.find((o) => o.id === item.id);
            return originalItem && item.propietario_id !== originalItem.propietario_id;
        });

		if (cambios.length === 0) {
			toast.info('No hay cambios de asignación para guardar.');
            if (localStorageKey) { localStorage.removeItem(localStorageKey); }
			return false;
		}

		const asignaciones = cambios.map((c) => ({ idRecurso: c.id, idUnidad: c.propietario_id || null }));
		
		try {
			await apiService.patch('/admin/recursos/asignaciones', { asignaciones });
			toast.success(`${asignaciones.length} asignacion(es) guardada(s) con éxito!`);
            if (localStorageKey) { localStorage.removeItem(localStorageKey); }
            return true;
		} catch (error) {
			toast.error('Error al guardar los cambios.');
            return false;
		}
	};

    const restaurarSesion = () => {
        setSesionGuardadaDetectada(false);
        toast.success("Trabajo restaurado. Continúa donde lo dejaste.");
    };

    const descartarSesionGuardada = () => {
        if (localStorageKey) { localStorage.removeItem(localStorageKey); }
        setSesionGuardadaDetectada(false);
        setWorkingItems(JSON.parse(JSON.stringify(originalItems)));
        setSelectedIds(new Set());
        setSelectionMemory(null);
        toast.info("Se descartaron los cambios de la sesión anterior.");
    };
    
	const hayCambiosSinGuardar = JSON.stringify(originalItems) !== JSON.stringify(workingItems);

	return {
		isLoading, items: workingItems, modo, setModo, selectedIds,
		toggleSelection, handleAsignar, handleDesasignar, guardarCambios,
		descartarCambios, hayCambiosSinGuardar,
        sesionGuardadaDetectada, restaurarSesion, descartarSesionGuardada,
        activateSelection, deactivateSelection,
	};
};