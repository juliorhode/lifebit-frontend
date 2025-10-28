// Ruta: src/hooks/useTabSync.js

/**
 * @file useTabSync.js
 * @description Hook para sincronizar el estado de la sesión (específicamente el logout)
 * entre múltiples pestañas del navegador utilizando el evento 'storage' de localStorage.
 */
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useTabSync = () => {
    // Obtenemos la acción de logout y el estado actual del store.
    const logout = useAuthStore((state) => state.logout);
    const estado = useAuthStore((state) => state.estado);

	useEffect(() => {
		/**
		 * @description Manejador del evento 'storage'. Se dispara en una pestaña cuando
		 * localStorage es modificado desde OTRA pestaña.
		 * @param {StorageEvent} event - El objeto del evento de almacenamiento.
		 */
		const handleStorageChange = (event) => {
			// Nos aseguramos de que el evento que estamos escuchando es el nuestro.
			if (event.key === 'logout-event') {
				// Solo ejecutamos el logout si la pestaña actual todavía cree que está logueada.
				// Esto previene llamadas redundantes.
				if (estado === 'loggedIn') {
					console.log(
						'[TabSync] Evento de logout detectado desde otra pestaña. Cerrando sesión localmente.'
					);
					logout();
				}
			}
		};

		// Añadimos el listener al objeto `window`.
		window.addEventListener('storage', handleStorageChange);

		// Función de limpieza: es crucial eliminar el listener cuando el componente
		// que usa este hook se desmonta para evitar fugas de memoria.
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [logout, estado]); // El efecto se suscribe de nuevo si la función `logout` o el `estado` cambian.
};
