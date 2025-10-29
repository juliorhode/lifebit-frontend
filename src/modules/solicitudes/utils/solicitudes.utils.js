/**
 * @file solicitudes.utils.js
 * @description Archivo para centralizar funciones de utilidad puras y reutilizables
 * para el módulo de Solicitudes. Mantiene los componentes limpios de lógica.
 */

/**
 * @description Genera la configuración de estilo para un badge de estado de solicitud.
 * @param {string} estado - El estado de la solicitud ('pendiente', 'aprobado', 'rechazado').
 * @returns {string} Una cadena con las clases de Tailwind CSS correspondientes.
 */
export const getEstadoBadgeClasses = (estado) => {
	switch (estado) {
		case 'aprobado':
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
		case 'rechazado':
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
		case 'pendiente':
		default:
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
	}
};
