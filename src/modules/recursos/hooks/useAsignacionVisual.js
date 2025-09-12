import { useState, useEffect, useCallback, useMemo } from 'react'; // MODIFICADO: Añadimos useMemo
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

/**
 * @description Un Hook personalizado que encapsula toda la lógica de estado y
 * las interacciones para el panel de asignación visual de recursos.
 *
 * @param {object|null} tipoRecurso - El tipo de recurso actualmente seleccionado.
 * @returns {object} Un objeto con el estado y las funciones para que la UI funcione.
 */
export const useAsignacionVisual = (tipoRecurso) => {
	const [isLoading, setIsLoading] = useState(false);
	const [originalItems, setOriginalItems] = useState([]);
	// MODIFICADO: 'workingItems' ahora representa el estado con cambios, antes del filtrado.
	const [workingItems, setWorkingItems] = useState([]);
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [modo, setModo] = useState('simple');
	// NUEVO: Estado para almacenar el término de búsqueda del usuario.
	const [searchTerm, setSearchTerm] = useState('');

	/**
	 * @description Carga el inventario desde la API. Se define con `useCallback`
	 * para que su referencia sea estable entre renders, optimizando los `useEffect` que dependen de ella.
	 */
	const fetchInventario = useCallback(async () => {
		const tipoId = tipoRecurso?.id;
		if (!tipoId) {
			setWorkingItems([]);
			setOriginalItems([]);
			return;
		}

		setIsLoading(true);
		try {
			const response = await apiService.get(`/admin/recursos/por-tipo/${tipoId}`);
			const itemsConEstado = response.data.data.recursos
				.map((item) => ({
					id: item.id,
					identificador_unico: item.identificador_unico,
					propietario_id: item.id_unidad,
					propietario_nombre: item.nombre_unidad_propietaria,
					estado: item.nombre_unidad_propietaria ? 'ocupado' : 'disponible',
				}))
				.sort((a, b) =>
					a.identificador_unico.localeCompare(b.identificador_unico, undefined, { numeric: true })
				);
			setWorkingItems(itemsConEstado);
			setOriginalItems(JSON.parse(JSON.stringify(itemsConEstado)));
		} catch (err) {
			toast.error('No se pudo cargar el inventario.');
		} finally {
			setIsLoading(false);
		}
	}, [tipoRecurso?.id]);

	// Efecto que llama a `fetchInventario` cuando `tipoRecurso` cambia.
	useEffect(() => {
		fetchInventario();
	}, [fetchInventario]);

	/**
	 * @description Limpia la selección actual y revierte el estado visual de los items.
	 */
	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
		setWorkingItems((prevItems) =>
			prevItems.map((item) => {
				if (item.estado === 'seleccionado') {
					const originalState = originalItems.find(o => o.id === item.id)?.estado || (item.propietario_nombre ? 'ocupado' : 'disponible');
					return { ...item, estado: originalState };
				}
				return item;
			})
		);
	}, [originalItems]);

	// Efecto para limpiar la selección si el usuario cambia de modo.
	useEffect(() => {
		clearSelection();
	}, [modo, clearSelection]);

	/**
	 * @description Maneja la selección/deselección de un item en modo masivo.
	 */
	const toggleSelection = (itemToToggle) => {
		const newSelectedIds = new Set(selectedIds);
		const isCurrentlySelected = newSelectedIds.has(itemToToggle.id);

		if (isCurrentlySelected) {
			newSelectedIds.delete(itemToToggle.id);
		} else {
			newSelectedIds.add(itemToToggle.id);
		}
		setSelectedIds(newSelectedIds);

		setWorkingItems((prev) =>
			prev.map((item) => {
				if (item.id === itemToToggle.id) {
					const originalState = originalItems.find(o => o.id === item.id)?.estado || (item.propietario_nombre ? 'ocupado' : 'disponible');
					return {
						...item,
						estado: !isCurrentlySelected ? 'seleccionado' : originalState,
					};
				}
				return item;
			})
		);
	};

	/**
	 * @description Asigna una unidad a uno o más items en el estado de trabajo.
	 */
	const handleAsignar = (itemIds, unidad) => {
		setWorkingItems((prev) =>
			prev.map((item) => {
				if (itemIds.includes(item.id)) {
					return {
						...item,
						estado: 'ocupado',
						propietario_id: unidad.id,
						propietario_nombre: unidad.numero_unidad,
					};
				}
				return item;
			})
		);
		clearSelection();
	};

	/**
	 * @description Desasigna uno o más items en el estado de trabajo.
	 */
	const handleDesasignar = (itemIds) => {
		setWorkingItems((prev) =>
			prev.map((item) => {
				if (itemIds.includes(item.id)) {
					return {
						...item,
						estado: 'disponible',
						propietario_id: null,
						propietario_nombre: null,
					};
				}
				return item;
			})
		);
		clearSelection();
	};

	/**
	 * @description Descarta todos los cambios realizados y vuelve al estado original.
	 */
	const descartarCambios = () => {
		setWorkingItems(JSON.parse(JSON.stringify(originalItems)));
		clearSelection();
		toast.info('Cambios descartados.');
	};

	/**
	 * @description Calcula los cambios y los envía a la API para guardarlos.
	 */
	const guardarCambios = async () => {
		const cambios = workingItems.filter(
			(item, index) => item.propietario_id !== originalItems[index]?.propietario_id
		);

		if (cambios.length === 0) {
			toast.info('No hay cambios para guardar.');
			return;
		}

		const asignaciones = cambios.map((c) => ({
			idRecurso: c.id,
			idUnidad: c.propietario_id || null,
		}));

		try {
			await apiService.patch('/admin/recursos/asignaciones', { asignaciones });
			toast.success(`${asignaciones.length} asignacion(es) guardada(s) con éxito!`);
			fetchInventario(); // Re-sincronizamos con la base de datos.
		} catch (error) {
			toast.error('Error al guardar los cambios.');
		}
	};

	// NUEVO: Lógica de filtrado con useMemo para optimización.
	// Esta función solo se re-ejecutará si `workingItems` o `searchTerm` cambian.
	const filteredItems = useMemo(() => {
		if (!searchTerm) {
			return workingItems; // Si no hay búsqueda, devuelve todos los items.
		}
		return workingItems.filter(item =>
			item.identificador_unico.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [workingItems, searchTerm]);


	// Variable computada para saber si hay cambios pendientes.
	const hayCambiosSinGuardar = JSON.stringify(originalItems) !== JSON.stringify(workingItems);

	// El hook devuelve un objeto con todo lo que la UI necesita.
	return {
		isLoading,
		items: filteredItems, // MODIFICADO: Ahora exponemos los items ya filtrados.
		modo,
		setModo,
		selectedIds,
		toggleSelection,
		handleAsignar,
		handleDesasignar,
		guardarCambios,
		descartarCambios,
		hayCambiosSinGuardar,
		searchTerm,      // NUEVO: Exponemos el término de búsqueda.
		setSearchTerm,   // NUEVO: Exponemos la función para actualizar la búsqueda.
	};
};
