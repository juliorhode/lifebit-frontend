import { create } from 'zustand';
import apiService from '../services/apiService';

/**
 * @description Crea un "slice" o almacén de Zustand para manejar el estado de autenticación.
 *
 * Zustand es una librería de manejo de estado minimalista. 'create' es la función principal
 * que recibe una función para configurar nuestro almacén.
 *
 * El parámetro 'set' es la función que usamos para actualizar el estado de forma inmutable.
 */
export const useAuthStore = create((set, get) => ({
	// La app empieza aquí
	estado: 'initial', // initial -> loading -> (loggedIn | loggedOut | error)
	accessToken: null,
	usuario: null,
	error: null,

	// 2. DEFINICIÓN DE LAS ACCIONES
	/**
	 * @description Orquesta el proceso de inicio de sesión.
	 * @param {string} email - El correo del usuario.
	 * @param {string} contraseña - La contraseña del usuario.
	 */
	login: async (email, contraseña) => {
		// Ponemos el estado en 'loading' para que la UI pueda mostrar un spinner.
		set({ estado: 'loading', error: null });
		try {
			// Usamos nuestro servicio de API centralizado para hacer la petición.
			const response = await apiService.post('/auth/login', { email, contraseña });

			// Leemos la estructura de datos que viene desde el backend.
			// Esto se llama "desestructuración" de objetos en JavaScript.
			const { accessToken, data } = response.data;
			const usuario = data.usuario; // Extraemos el usuario del objeto 'data'
			if (!accessToken || !usuario) {
				throw new Error('Resṕuesta inesperada del servidor.');
			}
			// Si todo fue bien, actualizamos el estado con los datos recibidos.
			set({
				accessToken: accessToken, // El token principal
				usuario: usuario, // El objeto de usuario anidado que viene de data
				estado: 'loggedIn',
			});
			// Opcional: podrías guardar el token en localStorage aquí si quieres persistencia
			// de sesión entre recargas de página. Lo veremos más adelante.
		} catch (error) {
			// Si la API devuelve un error (ej. 401 Unauthorized)...
			const errorMessage =
				error.response?.data?.message || 'Error desconocido al iniciar sesión.';
			// Guardamos el error y revertimos el estado.
			set({
				estado: 'error',
				error: errorMessage,
				accessToken: null,
				usuario: null,
			});
		}
	},
	/**
	 * @description Guarda un accessToken directamente en el estado.
	 * Útil para flujos como el callback de OAuth.
	 * @param {string} token - El accessToken JWT.
	 */
	setToken: (token) => {
		set({ accessToken: token, estado: 'loading' }); // Ponemos 'loading' mientras buscamos el perfil
	},
	/**
	 * @description Obtiene el perfil del usuario autenticado usando el token
	 * que ya está en el estado y actualiza la información del usuario.
	 */
	getProfile: async () => {
		// getState() o get() nos permite leer el estado actual dentro de una acción
		const token = get().accessToken;
		if (!token) return; // No hacer nada si no hay token

		try {
			const response = await apiService.get('/perfil/me');
			// La respuesta de tu backend es { success: true, data: { user: {...} } }
			const usuario = response.data.data.user;

			set({
				usuario: usuario,
				estado: 'loggedIn', // ¡Login completado exitosamente!
				error: null,
			});
		} catch (error) {
			const errorMessage = error.response?.data?.message || 'Error al obtener el perfil.';
			set({
				estado: 'error',
				error: errorMessage,
				accessToken: null,
				usuario: null,
			});
		}
	},
	/**
	 * @description Cierra la sesión del usuario de forma segura.
	 * Limpia el estado del cliente y llama al backend para invalidar la sesión.
	 */
	logout: async () => {
		try {
			// 1. Llama al backend para que invalide el refreshToken (HttpOnly cookie)
			// y realice cualquier otra limpieza de sesión en el lado del servidor.
			await apiService.post('/auth/logout');
		} catch (error) {
			// Incluso si la llamada al backend falla (ej. por pérdida de conexión),
			// debemos continuar con la limpieza del estado en el cliente.
			console.error('Error al cerrar sesión en el servidor:', error);
		} finally {
			// Simplemente reseteamos el estado a sus valores iniciales.
			set({
				accessToken: null,
				usuario: null,
				estado: 'loggedOut',
				error: null,
			});
		}
		// Opcional: removemos el token de localStorage si lo hubiéramos guardado.
	},

	// --- ACCIÓN DE PERSISTENCIA ---
	/**
	 * @description Intenta refrescar la sesión del usuario al cargar la aplicación.
	 * Esta es la acción central para la persistencia de la sesión.
	 * Llama al endpoint de refresh-token y espera recibir tanto un nuevo accessToken
	 * como el objeto de usuario completo en una sola respuesta.
	 */
	refreshToken: async () => {
		// Ponemos el estado en 'loading' para indicar que estamos verificando.
		set({ estado: 'loading' });

		try {
			// Hacemos la petición al backend. El navegador enviará la cookie HttpOnly.
			const response = await apiService.post('/auth/refresh-token');
			// Desestructuramos la respuesta para obtener el nuevo token y el usuario.
			const { accessToken, data } = response.data;
			const usuario = data?.usuario; // Extraemos el usuario del objeto 'data', si existe

			if (accessToken && usuario) {
				// --- ACTUALIZACIÓN ATÓMICA ---
				// Actualizamos el estado con el nuevo token y el objeto de usuario
				// en una única operación.
				set({
					accessToken: accessToken,
					usuario: usuario,
					estado: 'loggedIn',
					error: null,
				});
				console.log('Sesión renovada automáticamente al cargar la app.', usuario);
				
				

				// esto se suplanta por la actualización atómica arriba
				// Si tenemos un nuevo accessToken, lo guardamos...
				// get().setToken(accessToken);
				// ...y obtenemos el perfil del usuario para completar el login.
				// await get().getProfile();
				// `getProfile` se encargará de poner el estado en 'loggedIn'.
			} else {
				// Si la respuesta no trae un token (caso improbable), forzamos el logout.
				throw new Error('Respuesta inválida del servidor al refrescar token.');
			}
		} catch (error) {
			// Si la petición falla (ej. 401, no hay cookie o expiró),
			// significa que no hay una sesión válida. Limpiamos todo.
			console.log(
				'No se pudo refrescar la sesión, cerrando sesión localmente:',
				error.message
			);
			set({
				accessToken: null,
				usuario: null,
				estado: 'loggedOut',
				error: null,
			});
		}
	},
}));
