import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * @description Instancia de Axios pre-configurada.
 *
 * Se establece la URL base de todas las peticiones a la API del backend.
 * Esto evita tener que escribir la URL completa en cada llamada.
 */
const apiService = axios.create({
	baseURL: '/api', // La URL base de tu API backend.
	headers: {
		'Content-Type': 'application/json',
	},
});
/**
 * @description Interceptor de peticiones de Axios.
 *
 * Este interceptor se ejecuta ANTES de que cada petición sea enviada.
 * Su propósito es añadir el token de autenticación a las cabeceras
 * de forma automática si el usuario está logueado.
 */
apiService.interceptors.request.use(
	(config) => {
		// Obtenemos el estado MÁS RECIENTE de nuestro almacén de Zustand.
		// No podemos usar el hook 'useAuthStore' aquí porque no es un componente de React.
		// getState() nos da acceso directo al estado actual.
		const { accessToken } = useAuthStore.getState();
		// Si existe un accessToken, lo añadimos a la cabecera 'Authorization'.
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		// Devolvemos la configuración modificada para que la petición continúe.
		return config;
	},
	(error) => {
		// Si hay un error al configurar la petición, lo rechazamos.
		return Promise.reject(error);
	}
);

// Exportamos la instancia configurada para que pueda ser usada en toda la aplicación.
export default apiService;