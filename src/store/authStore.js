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
export const useAuthStore = create((set) => ({
	estado: 'loggedOut', // Posibles valores: 'loggedOut', 'loading', 'loggedIn', 'error'
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
	 * @description Cierra la sesión del usuario.
	 */
	logout: () => {
		// Simplemente reseteamos el estado a sus valores iniciales.
		set({
			accessToken: null,
			usuario: null,
			estado: 'loggedOut',
			error: null,
		});
		// Opcional: removemos el token de localStorage si lo hubiéramos guardado.
	},
}));
