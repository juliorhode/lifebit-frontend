import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

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
	// Esta opción le dice a Axios que debe enviar cookies (como nuestro
	// refreshToken HttpOnly) en las peticiones al backend.
	withCredentials: true,
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

/**
 * @description Interceptor de respuestas de Axios.
 * Es el cerebro de la renovación automática y transparente de tokens.
 */
// apiService.interceptors.response.use(
//     // 1. Función para respuestas exitosas (status 2xx)
//     // Simplemente devolvemos la respuesta para que el flujo continúe.
//     (response) => {
//         return response;
//     },
//     // 2. Función para respuestas de error
//     async (error) => {
//         const originalRequest = error.config;

//         // Condición de actuación:
//         // - El error es un 401 (Unauthorized).
//         // - La petición original NO FUE un intento de refrescar el token
//         //   (para evitar un bucle infinito si el refreshToken también falla).
//         // - La bandera `_retry` no está presente (para evitar reintentos infinitos).
//         if (error.response.status === 401 && !originalRequest._retry) {
            
//             // Ponemos una bandera en la petición original para marcar que ya la hemos reintentado.
//             originalRequest._retry = true;
            
//             console.log('%c[apiService] Token expirado. Intentando renovar...', 'color: yellow;');

//             try {
//                 // Obtenemos las acciones del store directamente con getState().
//                 const { refreshToken, logout } = useAuthStore.getState();
                
//                 // Llamamos a la acción refreshToken. Esta es la llamada crítica.
//                 // Esta acción es `async` y dentro de ella se actualiza el estado.
//                 await refreshToken();

//                 // Después de un `refreshToken` exitoso, el `authStore` ya tiene el nuevo `accessToken`.
//                 // El interceptor de PETICIÓN (`request.use`) se encargará de añadirlo
//                 // automáticamente a la cabecera de la petición que vamos a reintentar.
                
//                 console.log('%c[apiService] Token renovado. Reintentando petición original...', 'color: lightgreen;');

//                 // Reintentamos la petición original. Axios usará el nuevo token gracias al interceptor de peticiones.
//                 return apiService(originalRequest);

//             } catch (refreshError) {
// 				// Si `refreshToken` falla (ej. el refreshToken también expiró),
// 				// la sesión ya no es recuperable.
// 				console.error(
// 					'[apiService] Falló la renovación del token. Cerrando sesión.',
// 					refreshError
// 				);
// 				// Notificamos al usuario que su sesión ha terminado de forma definitiva.
// 				toast.error('Tu sesión ha expirado. Serás redirigido al login.');

// 				// Forzamos un logout completo.
// 				useAuthStore.getState().logout();

// 				// Rechazamos la promesa para que el componente que hizo la llamada original
// 				// también sepa que la operación falló definitivamente.
// 				return Promise.reject(refreshError);
// 			}
//         }

//         // Para cualquier otro error (ej. 404, 500, o un 401 que no queremos reintentar),
//         // simplemente lo propagamos.
//         return Promise.reject(error);
//     }
// );

// --- LÓGICA DE MANEJO DE REFRESH TOKEN CONCURRENTE ---
// `isRefreshing` previene que se inicien múltiples `refreshToken` si fallan varias peticiones.
let isRefreshing = false;
// `failedQueue` almacena las peticiones que fallaron mientras se refrescaba el token.
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

apiService.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			
            // Si ya hay un refresco en curso, no iniciamos otro.
            // En su lugar, creamos una nueva promesa y la "aparcamos" en la cola.
            // Esta promesa se resolverá (o rechazará) cuando el refresco original termine.
			if (isRefreshing) {
				return new Promise(function(resolve, reject) {
					failedQueue.push({ resolve, reject });
				}).then(token => {
                    // Cuando la promesa se resuelva, significa que tenemos un nuevo token.
					originalRequest.headers['Authorization'] = 'Bearer ' + token;
					return apiService(originalRequest); // Reintentamos la petición original.
				});
			}

			originalRequest._retry = true;
            isRefreshing = true;

			return new Promise(function(resolve, reject) {
                const { refreshToken, logout } = useAuthStore.getState();

                refreshToken().then(() => {
                    const newAccessToken = useAuthStore.getState().accessToken;
                    
                    // Actualizamos la cabecera de la petición original.
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    
                    // Procesamos la cola de peticiones que estaban esperando.
                    processQueue(null, newAccessToken);
                    
                    // Resolvemos la promesa de la petición original.
                    resolve(apiService(originalRequest));
                }).catch((err) => {
                    // Si el refresh-token falla, procesamos la cola con un error
                    // y forzamos el logout.
                    processQueue(err, null);
                    toast.error('Tu sesión ha expirado. Serás redirigido al login.');
                    logout();
                    reject(err);
                }).finally(() => {
                    isRefreshing = false;
                });
			});
		}

		return Promise.reject(error);
	}
);


// Exportamos la instancia configurada para que pueda ser usada en toda la aplicación.
export default apiService;