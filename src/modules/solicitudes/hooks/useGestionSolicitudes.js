// Ruta: src/modules/solicitudes/hooks/useGestionSolicitudes.js

/**
 * @file useGestionSolicitudes.js
 * @description Hook "Maestro" y ÚNICA FUENTE DE VERDAD para el módulo de Solicitudes.
 * Sigue el patrón establecido en `useGestionResidentes` para centralizar toda la lógica.
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useGestionSolicitudes = () => {
	// --- ESTADO CENTRALIZADO ---
	const [solicitudes, setSolicitudes] = useState([]);
	const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
	const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [licencias, setLicencias] = useState([]);

	/**
	 * @description Bandera que indica si el polling ha detectado cambios en el backend.
	 */
	const [hayDatosNuevos, setHayDatosNuevos] = useState(false);

	// --- ESTADO DE LA UI (FILTROS Y PAGINACIÓN) ---
	const [filtros, setFiltros] = useState({
		q: '',
		estado: '', // Por defecto, mostramos todo.
		licencia: '',
		fecha_desde: '',
		fecha_hasta: '',
	});
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	/**
	 * @description Función principal para obtener los datos de la API.
	 * Ahora es dinámica: construye la URL con los parámetros de filtros y paginación.
	 */
    const fetchSolicitudes = useCallback(async () => {
        setHayDatosNuevos(false); // Al refrescar, reseteamos la bandera.
		setIsLoading(true);
		setError(null);

		try {
			// Usamos URLSearchParams para construir la query string de forma segura y limpia.
			const params = new URLSearchParams({
				page,
				limit,
			});
			if (filtros.q) params.append('q', filtros.q);
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.licencia) params.append('licencia', filtros.licencia);
			if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
			if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

			const response = await apiService.get(`/owner/solicitudes?${params.toString()}`);

			const { data, pagination: paginacionData } = response.data;
			setSolicitudes(data.solicitudes || []);
			setPagination(paginacionData || {});
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Error al obtener las solicitudes.';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [page, limit, filtros]); // Se re-ejecutará si la página, el límite o los filtros cambian.

	/**
	 * @description Realiza una recarga de datos en segundo plano.
	 * Compara los datos nuevos con los existentes y activa la bandera `hayDatosNuevos` si hay cambios.
	 */
	const refrescarPasivamente = useCallback(async () => {
		try {
			console.log('[Polling Pasivo Solicitudes] Buscando actualizaciones...');
			// Usamos los mismos filtros y paginación para la comparación.
			const params = new URLSearchParams({ page, limit });
			if (filtros.q) params.append('q', filtros.q);
			if (filtros.estado) params.append('estado', filtros.estado);

			const response = await apiService.get(`/owner/solicitudes?${params.toString()}`);
			const nuevasSolicitudes = response.data.data.solicitudes || [];

			// Comparamos los nuevos datos con el estado actual.
			// Usamos JSON.stringify para una comparación profunda simple y efectiva.
			// Si la cantidad de items o el contenido de los items ha cambiado, activamos la bandera.
			if (JSON.stringify(nuevasSolicitudes) !== JSON.stringify(solicitudes)) {
				console.log('[Polling Pasivo Solicitudes] Se detectaron cambios.');
				setHayDatosNuevos(true);
			} else {
				console.log('[Polling Pasivo Solicitudes] No se detectaron cambios.');
			}
		} catch (error) {
			// No mostramos un toast en caso de error para no molestar al usuario con fallos de fondo.
			console.error('Error durante el polling pasivo de solicitudes:', error);
		}
	}, [page, limit, filtros, solicitudes]); // Depende de los filtros actuales y de los datos existentes.

    /**
     * @description Función interna para cargar datos estáticos como las licencias. Prueba... pero segun dentro del useEffect de abajo
     */
    const fetchDatosIniciales = async () => {
        try {
            // Hacemos una llamada a la API para obtener la lista de todos los planes/licencias.
            // Asumimos que este endpoint existe o lo crearemos.
            const response = await apiService.get('owner/licencias/');
            setLicencias(response.data.data || []);
        } catch (error) {
            console.error('Error al cargar licencias:', error);
            toast.error('No se pudo cargar la lista de planes.');
        }
    };
    
	// Efecto que dispara la obtención de datos cuando cambian las dependencias.
    useEffect(() => {
        fetchSolicitudes();
        fetchDatosIniciales();
	}, [fetchSolicitudes]);

	// Efecto para el polling pasivo de datos.
	useEffect(() => {
		// Establecemos un intervalo que llamará a `refrescarPasivamente` cada 60 segundos.
		const intervalId = setInterval(() => {
			// Solo refrescamos si la pestaña del navegador está visible.
			if (document.visibilityState === 'visible') {
				refrescarPasivamente();
			}
		}, 60000); // 60 segundos

		// Limpiamos el intervalo cuando el componente se desmonta para evitar fugas de memoria.
		return () => clearInterval(intervalId);
	}, [refrescarPasivamente]); // La dependencia es nuestra función de refresco.

	// --- API PÚBLICA DEL HOOK ---
	return {
		// Datos y Estado
		solicitudes,
		pagination,
		isLoading,
		error,
		hayDatosNuevos,

		// Estado y Setters de UI
		filtros,
		setFiltros,
		page,
		setPage,
		limit,
        setLimit,
        licencias,

		// Acciones
		refrescarSolicitudes: fetchSolicitudes,
	};
};
