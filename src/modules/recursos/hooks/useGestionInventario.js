/**
 * @file Hook especializado para la lógica de la pantalla de gestión visual de inventario.
 * Inspirado en `useAsignacionVisual`, maneja el estado de los ítems, la selección,
 * los cambios temporales, la persistencia de sesión en localStorage.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useGestionInventario = (tipoRecurso) => {
	// --- ESTADO GLOBAL (Lectura con Selectores Individuales) ---
	// Se leen las piezas del estado global de forma individual para evitar re-renders
	// innecesarios y bucles infinitos, siguiendo nuestro estándar de arquitectura.

	// --- ESTADO LOCAL DEL HOOK ---
	const [isLoading, setIsLoading] = useState(true);
	const [originalItems, setOriginalItems] = useState([]);
	const [workingItems, setWorkingItems] = useState([]);
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [sesionGuardadaDetectada, setSesionGuardadaDetectada] = useState(false);

	// --- LÓGICA DE PERSISTENCIA EN LOCALSTORAGE ---
	const localStorageKey = useMemo(
		() => (tipoRecurso ? `lifebit-unsaved-inventario-${tipoRecurso.id}` : null),
		[tipoRecurso]
	);

	const saveSessionToLS = useCallback(
		(itemsToSave) => {
			if (localStorageKey) {
				const hayCambios = JSON.stringify(itemsToSave) !== JSON.stringify(originalItems);
				if (hayCambios) {
					localStorage.setItem(localStorageKey, JSON.stringify(itemsToSave));
				} else {
					localStorage.removeItem(localStorageKey);
				}
			}
		},
		[localStorageKey, originalItems]
	);

	// --- CARGA DE DATOS ---
	const fetchInventario = useCallback(async () => {
		if (!tipoRecurso?.id) return;
		setIsLoading(true);
		try {
			const response = await apiService.get(`/admin/recursos/por-tipo/${tipoRecurso.id}`);

			const itemsDesdeAPI = response.data.data.recursos
				.map((item) => ({
					id: item.id,
					identificador_unico: item.identificador_unico,
					ubicacion: item.ubicacion,
					estado_operativo: item.estado_operativo,
					estado: 'disponible',
					tipo_recurso: tipoRecurso.nombre,
				}))
				.sort((a, b) =>
					a.identificador_unico.localeCompare(b.identificador_unico, undefined, {
						numeric: true,
					})
				);

			setOriginalItems(itemsDesdeAPI);

			const sesionGuardadaJSON = localStorage.getItem(localStorageKey);
			if (sesionGuardadaJSON) {
				setWorkingItems(JSON.parse(sesionGuardadaJSON));
				setSesionGuardadaDetectada(true);
			} else {
				setWorkingItems(itemsDesdeAPI);
			}
		} catch (err) {
			toast.error('No se pudo cargar el inventario.');
		} finally {
			setIsLoading(false);
		}
	}, [tipoRecurso, localStorageKey]);

	useEffect(() => {
		fetchInventario();
	}, [fetchInventario]);

	// --- MANEJADORES DE ACCIONES ---
	const toggleSelection = useCallback(
		(itemToToggle) => {
			const newSelectedIds = new Set(selectedIds);
			if (newSelectedIds.has(itemToToggle.id)) {
				newSelectedIds.delete(itemToToggle.id);
			} else {
				newSelectedIds.add(itemToToggle.id);
			}

			setWorkingItems((prevItems) => {
				const nuevosItems = prevItems.map((item) => {
					if (item.id === itemToToggle.id) {
						return {
							...item,
							estado: newSelectedIds.has(item.id) ? 'seleccionado' : 'disponible',
						};
					}
					return item;
				});
				saveSessionToLS(nuevosItems);
				return nuevosItems;
			});
			setSelectedIds(newSelectedIds);
		},
		[selectedIds, saveSessionToLS]
	);

	/**
	 * @description Limpia la selección actual, reseteando el estado visual de los ítems
	 * a su estado base y vaciando el set de IDs seleccionados.
	 */
	const clearSelection = useCallback(
		(_options = { save: true }) => {
			setWorkingItems((prevItems) => {
				const itemsSinSeleccion = prevItems.map((item) => {
					if (selectedIds.has(item.id)) {
						return { ...item, estado: 'disponible' };
					}
					return item;
				});
				// Solo guardamos si la opción `save` es true.
				if (_options.save) {
					saveSessionToLS(itemsSinSeleccion);
				}
				return itemsSinSeleccion;
			});
			setSelectedIds(new Set());
		},
		[selectedIds, saveSessionToLS]); // Depende de `selectedIds` para saber qué limpiar.

	const handleMoverUbicacion = useCallback(
		(nuevaUbicacion) => {
			setWorkingItems((prevItems) => {
				const nuevosItems = prevItems.map((item) =>
					selectedIds.has(item.id) ? { ...item, ubicacion: nuevaUbicacion } : item
				);
				saveSessionToLS(nuevosItems);
				return nuevosItems;
			});
			toast.success(`${selectedIds.size} ítem(s) movido(s) a ${nuevaUbicacion}.`);
			// Limpiamos la selección después de que la acción se ha completado.
			clearSelection();
		},
		[selectedIds, saveSessionToLS, clearSelection]
	);

	const handleCambiarEstado = useCallback(
		(nuevoEstado) => {
			setWorkingItems((prevItems) => {
				const nuevosItems = prevItems.map((item) =>
					selectedIds.has(item.id) ? { ...item, estado_operativo: nuevoEstado } : item
				);
				saveSessionToLS(nuevosItems);
				return nuevosItems;
			});
			toast.success(
				`${selectedIds.size} ítem(s) marcado(s) como ${nuevoEstado.replace('_', ' ')}.`
			);
			// Limpiamos la selección después de que la acción se ha completado.
			clearSelection();
		},
		[selectedIds, saveSessionToLS, clearSelection]
	);

	const restaurarSesion = () => {
		setSesionGuardadaDetectada(false);
		toast.success('Trabajo anterior restaurado.');
	};

	const descartarSesionGuardada = () => {
		if (localStorageKey) localStorage.removeItem(localStorageKey);
		setWorkingItems(JSON.parse(JSON.stringify(originalItems)));
		setSesionGuardadaDetectada(false);
		setSelectedIds(new Set());
		toast.info('Se descartaron los cambios de la sesión anterior.');
	};

	const descartarCambios = () => {
		if (localStorageKey) localStorage.removeItem(localStorageKey);
		setWorkingItems(JSON.parse(JSON.stringify(originalItems)));
		setSelectedIds(new Set());
		toast.info('Cambios descartados.');
	};

	const guardarCambios = async () => {
		const cambios = workingItems.filter((item) => {
			const originalItem = originalItems.find((o) => o.id === item.id);
			return (
				!originalItem ||
				item.ubicacion !== originalItem.ubicacion ||
				item.estado_operativo !== originalItem.estado_operativo
			);
		});

		// Transformamos los valores a un array
		const payload = cambios.map((c) => [c.id, c.ubicacion, c.estado_operativo]);

		const toastId = toast.loading(`Guardando ${cambios.length} cambio(s)...`);

		try {
			// --- PUNTO DE INTEGRACIÓN CON EL BACKEND ---
			// Cuando el endpoint esté listo, esta será la llamada a la API.
			// Se asume un endpoint masivo que acepta un array de cambios.
			// await apiService.patch('/admin/recursos/inventario/batch', { cambios: payload });

			const respuesta = await apiService.patch('/admin/recursos/inventario', {
				cambios: payload,
			});

			toast.success(`${respuesta.data.message}`, {
				id: toastId,
			});

			// Solo borramos el borrador de localStorage si el backend confirma que afectó registros.
			console.log('Registros afectados:', respuesta.data.data.registrosAfectados);

			if (localStorageKey) {
				console.log('Borrando sesión guardada en localStorage con clave:', localStorageKey);
				localStorage.removeItem(localStorageKey);
			}

			clearSelection({ save: false }); // 
			return true;
		} catch (error) {
			toast.error(error.response?.data?.message || 'Error al guardar los cambios.', {
				id: toastId,
			});
			return false; // Indicamos que la operación falló.
		}
	};

	const hayCambiosSinGuardar = useMemo(
		() => JSON.stringify(originalItems) !== JSON.stringify(workingItems),
		[originalItems, workingItems]
	);

	return {
		isLoading,
		items: workingItems,
		// listaUbicaciones,
		selectedIds,
		hayCambiosSinGuardar,
		sesionGuardadaDetectada,
		toggleSelection,
		handleMoverUbicacion,
		handleCambiarEstado,
		guardarCambios,
		descartarCambios,
		restaurarSesion,
		descartarSesionGuardada,
	};
};
