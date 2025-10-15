/**
 * @file Este archivo centraliza funciones de utilidad puras y reutilizables
 * para el módulo de Perfil. Mantener la lógica de presentación y formato aquí
 * promueve el principio DRY y facilita la mantenibilidad y las pruebas.
 */

/**
 * @description Genera las clases de Tailwind CSS correspondientes al rol o estado de un usuario.
 * Centraliza la lógica de estilos de los "badges" para asegurar consistencia visual.
 * @param {string} value - El valor del rol o estado (ej. 'activo', 'administrador').
 * @returns {string} Una cadena de clases de Tailwind para aplicar al badge.
 */
export const getBadgeClasses = (value) => {
	switch (value) {
		case 'activo':
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
		case 'dueño_app':
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
		case 'administrador':
			return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
		case 'residente':
			return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
		default:
			// Un fallback seguro para cualquier valor inesperado.
			return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
	}
};
