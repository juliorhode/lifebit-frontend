/**
 * @description Hook maestro y ÚNICA FUENTE DE VERDAD para el módulo de residentes.
 * Centraliza toda la lógica de estado, llamadas a API y datos derivados, siguiendo
 * el principio de "Levantar el Estado" (Lifting State Up) para un flujo de datos predecible.
 *
 * ARQUITECTURA "SINGLE SOURCE OF TRUTH" (FUENTE ÚNICA DE VERDAD):
 * El propósito de esta arquitectura es eliminar la duplicación y desincronización de datos.
 * En lugar de que varios componentes (como el formulario y la página principal) pidan los
 * mismos datos a la API por separado, este hook lo hace una sola vez y distribuye la
 * información "verdadera" y actualizada a todos los que la necesiten.
 *
 * 1.  Este hook obtiene y mantiene el estado de:
 *     - Todos los residentes del edificio.
 *     - Todas las unidades (apartamentos) del edificio.
 *     - Todos los borradores de invitaciones guardados en el almacenamiento local del navegador.
 * 2.  Calcula datos derivados de forma eficiente (unidades disponibles, estadísticas)
 *     usando `useMemo` para evitar cálculos innecesarios en cada renderizado.
 * 3.  Provee una API limpia y clara (un conjunto de funciones y datos) al componente
 *     `ResidentesPage`, que actúa como orquestador.
 * 4.  Los componentes hijos (modales, formularios) reciben estos datos a través de props,
 *     asegurando un flujo de datos estrictamente unidireccional (de arriba hacia abajo).
 *
 * RESPONSABILIDADES CLAVE:
 * ✅ Gestión centralizada del estado de residentes, unidades y borradores.
 * ✅ Lógica para cargar y refrescar todos los datos necesarios desde la API.
 * ✅ Cálculo eficiente de las unidades que están disponibles para ser asignadas.
 * ✅ Gestión completa de los borradores (Crear, Leer, Actualizar, Eliminar) en localStorage.
 * ✅ Orquestación de la visibilidad de los modales (abrir/cerrar).
 * ✅ Servir como una "fachada" para las acciones de la API (invitar, suspender, etc.),
 *    ocultando la complejidad de las llamadas a `apiService`.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';
// Se importa la función v4 de la librería 'uuid' para generar identificadores únicos universales.
// Esto es crucial para asignar un ID único e irrepetible a cada borrador que guardamos.
// Necesitarás instalar esta dependencia ejecutando: npm install uuid
import { v4 as uuidv4 } from 'uuid';

export const useGestionResidentes = () => {
	// =================================================================
	// DEPARTAMENTO DE ESTADO CENTRALIZADO (LA FUENTE DE VERDAD)
	// Aquí reside toda la información cruda que el módulo necesita para funcionar.
	// =================================================================

	// Almacena la lista completa de residentes obtenida de la API.
	const [residentes, setResidentes] = useState([]);
	// Almacena la lista completa de unidades del edificio.
	const [unidades, setUnidades] = useState([]);
	// Almacena la lista de borradores leídos desde el localStorage del navegador.
	const [borradores, setBorradores] = useState([]);
	// Gestiona el estado del proceso de carga de datos para mostrar indicadores en la UI.
	// Posibles valores: 'cargando', 'listo', 'error'.
	const [estadoCarga, setEstadoCarga] = useState('cargando');
	// Registra la fecha y hora de la última actualización exitosa de datos.
	const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

	// =================================================================
	// DEPARTAMENTO DE ESTADO DE LA INTERFAZ DE USUARIO (UI)
	// Controla los elementos visuales como filtros, modales y estados de acciones.
	// =================================================================

	// El texto introducido por el usuario en la barra de búsqueda.
	const [searchTerm, setSearchTerm] = useState('');
	// El filtro de estado seleccionado ('todos', 'activos', 'invitado', 'suspendidos').
	const [filtroEstado, setFiltroEstado] = useState('todos');
	// Controlan la visibilidad de los diferentes modales.
	const [isInvitarModalOpen, setIsInvitarModalOpen] = useState(false);
	const [isMasivoModalOpen, setIsMasivoModalOpen] = useState(false);
	const [isSuspenderModalOpen, setIsSuspenderModalOpen] = useState(false);
	// Almacenan el contexto para los modales (qué residente se edita o suspende).
	const [residenteEditando, setResidenteEditando] = useState(null);
	const [residenteASuspender, setResidenteASuspender] = useState(null);
	// Guarda los datos de un borrador cuando se carga en el formulario.
	const [datosBorrador, setDatosBorrador] = useState(null);
	// Guarda el ID del residente sobre el que se está ejecutando una acción (ej. suspender).
	// Útil para mostrar un spinner en un botón específico.
	const [idAccion, setIdAccion] = useState(null);

	// =================================================================
	// LÓGICA DE CARGA Y REFRESCADO DE DATOS
	// =================================================================

	/**
	 * @description Orquesta la carga de todos los datos esenciales para el módulo.
	 * Utiliza Promise.all para ejecutar las llamadas a la API en paralelo, lo cual es
	 * más eficiente que hacerlas una por una en secuencia.
	 */
	const cargarDatos = useCallback(async () => {
		setEstadoCarga('cargando');
		try {
			const [resResidentes, resUnidades] = await Promise.all([
				apiService.get('/admin/residentes'),
				apiService.get('/admin/unidades'),
			]);

			// Actualizamos el estado con los datos recibidos de la API.
			// Usamos '|| []' como fallback para asegurar que siempre sea un array.
			setResidentes(resResidentes.data.data || []);
			setUnidades(resUnidades.data.data?.unidades || []);

			// Una vez cargados los datos de la API, sincronizamos el estado de borradores.
			cargarBorradoresDesdeStorage();

			setUltimaActualizacion(new Date());
			setEstadoCarga('listo');
		} catch (error) {
			console.error('Error al cargar datos del módulo de residentes:', error);
			toast.error('No se pudieron cargar los datos del módulo.');
			setEstadoCarga('error');
		}
	}, []); // Dejamos el array de dependencias vacío intencionadamente, se explica más abajo.

	// Este `useEffect` se ejecuta solo una vez cuando el componente que usa el hook se monta por primera vez.
	// Su única responsabilidad es iniciar la carga de datos inicial.
	useEffect(() => {
		cargarDatos();
	}, [cargarDatos]); // `cargarDatos` está envuelta en `useCallback` y su referencia no cambia,
	// por lo que este efecto se ejecuta una sola vez, como se espera.

	// =================================================================
	// LÓGICA DE DATOS DERIVADOS (CALCULADOS CON useMemo)
	// Estos datos no son estado, sino que se calculan a partir del estado "fuente de verdad".
	// `useMemo` es una optimización clave: el cálculo solo se re-ejecuta si sus dependencias cambian.
	// =================================================================

	/**
	 * @description Calcula la lista de unidades disponibles para ser asignadas.
	 * Este es un punto crítico de la nueva arquitectura. Al centralizar este cálculo aquí,
	 * cualquier cambio en la lista de `residentes` (ej. una nueva invitación)
	 * provocará un re-cálculo automático y la UI se actualizará consistentemente.
	 * @returns {Array} Un array con los objetos de las unidades disponibles.
	 */
	const unidadesDisponibles = useMemo(() => {
		// Creamos un Set (una estructura de datos muy rápida para búsquedas) con
		// los `numero_unidad` de todos los residentes que ya están activos.
		const unidadesOcupadas = new Set(
			residentes
				.filter((res) => res.estado === 'activo' || res.estado === 'invitado')
				.map((res) => res.numero_unidad)
		);
		// Filtramos la lista total de unidades, devolviendo solo aquellas que NO están en el Set de ocupadas.
		return unidades.filter((u) => !unidadesOcupadas.has(u.numero_unidad));
	}, [residentes, unidades]); // Dependencias: se recalculará solo si `residentes` o `unidades` cambian.

	/**
	 * @description Filtra la lista de residentes según el término de búsqueda y el filtro de estado.
	 * @returns {Array} La lista de residentes filtrada para mostrar en la tabla.
	 */
	const residentesFiltrados = useMemo(() => {
		return residentes.filter((residente) => {
			const busqueda = searchTerm.toLowerCase();
			const coincideBusqueda =
				residente.nombre?.toLowerCase().includes(busqueda) ||
				residente.apellido?.toLowerCase().includes(busqueda) ||
				residente.email?.toLowerCase().includes(busqueda) ||
				residente.numero_unidad?.toLowerCase().includes(busqueda);

			const coincideEstado =
				filtroEstado === 'todos' ||
				(filtroEstado === 'activos' && residente.estado === 'activo') ||
				(filtroEstado === 'inactivos' &&
					(residente.estado === 'invitado' || residente.estado === 'suspendido')); // Agrupamos todos los no-activos.

			return coincideBusqueda && coincideEstado;
		});
	}, [residentes, searchTerm, filtroEstado]);

	/**
	 * @description Calcula las estadísticas clave para el panel superior.
	 * @returns {Object} Un objeto con las estadísticas { total, activos, pendientes }.
	 */
	const estadisticas = useMemo(() => {
		const total = residentes.length;
		const activos = residentes.filter((r) => r.estado === 'activo').length;
		const pendientes = residentes.filter((r) => r.estado === 'invitado').length;
		return { total, activos, pendientes };
	}, [residentes]);

	// =================================================================
	// GESTIÓN DE BORRADORES (Lógica centralizada)
	// =================================================================

	/**
	 * @description Lee todas las claves de borradores de `localStorage`, las valida,
	 * y actualiza el estado `borradores`. Es la única función que lee del storage.
	 * Usamos `useCallback` para que esta función no se recree en cada render, optimizando rendimiento.
	 */
	const cargarBorradoresDesdeStorage = useCallback(() => {
		const borradoresGuardados = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith('borrador_residente_')) {
				try {
					const borrador = JSON.parse(localStorage.getItem(key));
					// Nos aseguramos de que el objeto guardado tenga la estructura mínima esperada.
					if (borrador && borrador.id && borrador.timestamp) {
						// Añadimos la 'key' de localStorage al objeto para poder eliminarlo fácilmente después.
						borradoresGuardados.push({ ...borrador, key });
					} else {
						localStorage.removeItem(key); // Limpieza de datos corruptos.
					}
				} catch (error) {
					// Si el JSON está malformado, lo eliminamos para mantener la higiene.
					localStorage.removeItem(key);
				}
			}
		}
		setBorradores(borradoresGuardados);
	}, []);

	/**
	 * @description Guarda o actualiza un borrador en `localStorage`. Esta función es "consciente del contexto".
	 * Si los datos del formulario ya contienen un `id`, actualiza el borrador existente.
	 * Si no hay `id`, crea un nuevo borrador con un `uuid` fresco.
	 * @param {Object} datosFormulario Los datos actuales del formulario, que pueden incluir un `id` de borrador.
	 */
	const handleGuardarBorrador = (datosFormulario) => {
		let idBorrador = datosFormulario.id;
		const esActualizacion = !!idBorrador; // Convertimos el id a un booleano para saber si es una actualización.

		// Si no hay ID, es un borrador nuevo, por lo que generamos un UUID para él.
		if (!esActualizacion) {
			idBorrador = uuidv4();
		}

		const borrador = {
			...datosFormulario,
			id: idBorrador, // Aseguramos que el ID (nuevo o existente) esté en el objeto.
			timestamp: Date.now(),
		};

		const storageKey = `borrador_residente_${idBorrador}`;
		localStorage.setItem(storageKey, JSON.stringify(borrador));

		// Sincronizamos el estado de borradores en la aplicación para que la UI reaccione.
		cargarBorradoresDesdeStorage();

		// Damos un feedback al usuario que diferencia entre guardar por primera vez y actualizar.
		toast.success(esActualizacion ? 'Borrador actualizado.' : 'Borrador guardado.');
	};

	/**
	 * @description Elimina un borrador específico de `localStorage`.
	 * @param {string} key La clave completa del item a eliminar (ej. 'borrador_residente_uuid').
	 */
	const handleEliminarBorrador = (key) => {
		localStorage.removeItem(key);
		cargarBorradoresDesdeStorage(); // Re-sincronizamos el estado.
		toast.success('Borrador eliminado.');
	};

	// =================================================================
	// ORQUESTACIÓN DE MODALES Y CONTEXTO
	// =================================================================

	const handleOpenInvitarModal = () => {
		setResidenteEditando(null);
		setDatosBorrador(null);
		setIsInvitarModalOpen(true);
	};

	const handleCargarBorrador = (borrador) => {
		setResidenteEditando(null);
		setDatosBorrador(borrador);
		setIsInvitarModalOpen(true);
	};

	const handleEditarResidente = (residente) => {
		setDatosBorrador(null);
		setResidenteEditando(residente);
		setIsInvitarModalOpen(true);
	};

	const handleSuspenderResidente = (residente) => {
		setResidenteASuspender(residente);
		setIsSuspenderModalOpen(true);
	};

	const handleCloseModals = () => {
		setIsInvitarModalOpen(false);
		setIsMasivoModalOpen(false);
		setIsSuspenderModalOpen(false);
		setResidenteEditando(null);
		setResidenteASuspender(null);
		setDatosBorrador(null);
	};

	// =================================================================
	// ACCIONES (Manejo de llamadas a la API que modifican datos)
	// =================================================================

	/**
	 * @description Se ejecuta tras el envío exitoso de una invitación o una edición.
	 * Orquesta la limpieza, el refresco de datos y la notificación al usuario.
	 */
	const handleInvitacionExitosa = () => {
		// Si la acción provino de un borrador (y no era una edición), lo eliminamos.
		if (datosBorrador && !residenteEditando) {
			handleEliminarBorrador(datosBorrador.key);
		}

		handleCloseModals();
		// Recargamos TODOS los datos. Esto asegura que la lista de residentes
		// y la lista de unidades disponibles estén perfectamente sincronizadas.
		cargarDatos();

		const mensaje = residenteEditando ? 'Residente actualizado' : 'Invitación enviada';
		toast.success(`${mensaje} exitosamente.`);
	};

	/**
	 * @description Confirma la suspensión o reactivación de un residente.
	 */
	const confirmarCambioEstado = async () => {
		if (!residenteASuspender) return;

		setIdAccion(residenteASuspender.id);
		const esSuspension = residenteASuspender.estado !== 'suspendido';
		const endpoint = `/admin/residentes/${residenteASuspender.id}`;
		// Dependiendo de la acción, usamos el método HTTP DELETE o PATCH.
		const accionAPI = esSuspension
			? apiService.delete(endpoint)
			: apiService.patch(endpoint, { estado: 'activo' });
		const verboPasado = esSuspension ? 'suspendido' : 'reactivado';

		try {
			await accionAPI;
			toast.success(`Residente ${residenteASuspender.nombre} ${verboPasado}.`);
			handleCloseModals();
			cargarDatos(); // Refrescamos todo para mantener la consistencia.
		} catch (error) {
			toast.error(`Error al ${esSuspension ? 'suspender' : 'reactivar'}.`);
		} finally {
			setIdAccion(null); // Limpiamos el ID de la acción en cualquier caso.
		}
	};

	// =================================================================
	// API PÚBLICA DEL HOOK
	// Devolvemos un objeto con todos los datos y funciones que los
	// componentes necesitarán para funcionar.
	// =================================================================
	return {
		// Datos y Estado
		residentesFiltrados,
		estadisticas,
		unidadesDisponibles, // La lista calculada de unidades libres.
		unidadesTotales: unidades, // La lista completa, por si se necesita.
		borradores,
		estadoCarga,
		ultimaActualizacion,

		// Estado y Setters de UI
		searchTerm,
		setSearchTerm,
		filtroEstado,
		setFiltroEstado,

		// Estado y Handlers de Modales
		isInvitarModalOpen,
		isMasivoModalOpen,
		isSuspenderModalOpen,
		residenteEditando,
		residenteASuspender,
		datosBorrador,
		handleOpenInvitarModal,
		handleCargarBorrador,
		setIsMasivoModalOpen,
		handleEditarResidente,
		handleSuspenderResidente,
		handleCloseModals,

		// Acciones
		confirmarCambioEstado,
		idAccion,
		handleInvitacionExitosa,
		handleGuardarBorrador, // La nueva función para que el formulario guarde.
		handleEliminarBorrador, // La nueva función para que el panel elimine.

		// Refresco
		refrescarDatos: cargarDatos, // Exponemos la función principal de carga.
	};
};
