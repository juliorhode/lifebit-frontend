/**
 * =================================================================
 * MANIFIESTO DE DISEÑO Y MARCA DE LIFEBIT
 * =================================================================
 * Este archivo es para nuestra identidad visual.
 * Define los colores, estilos de componentes y otros activos de la marca.
 */

// -----------------------------------------------------------------
// 1. PALETA DE COLORES
// -----------------------------------------------------------------
// Definimos los valores de color de nuestra marca.
// Esto nos permite cambiarlos en un solo lugar y que se propaguen
// a todas las clases de estilo que los usan.
export const COLORS = {
	primary: {
		main: '#3B82F6', // Azul Principal (blue-500)
		hover: '#2563EB', // Azul Oscuro para Hover (blue-600)
	},
	// Podríamos añadir más colores aquí (secondary, accent, etc.)
};

// -----------------------------------------------------------------
// 2. CLASES DE ESTILO REUTILIZABLES (className)
// -----------------------------------------------------------------
// Usamos los colores y activos definidos arriba para construir nuestras
// clases de estilo de Tailwind.
export const STYLES = {
	// --- FONDOS ---
	backgroundPage: 'bg-gray-900 text-gray-200',
	backgroundCard: 'bg-gray-800 text-gray-200',

	// --- INPUTS Y FORMULARIOS ---
	input: 'w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white',
	label: 'block text-left text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200',
	errorText: 'text-red-500 dark:text-red-400 text-xs mt-1',

	// --- BOTONES ---
	buttonPrimary:
		'w-full h-[54px] flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed',
	buttonGoogle:
		'w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors',
	buttonLink: 'text-sm text-blue-500 hover:underline focus:outline-none',

	// --- TARJETAS Y CONTENEDORES ---
	card: 'bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl',

	// --- TEXTOS ---
    titlePage: 'text-3xl font-bold text-gray-900 dark:text-white',
    lifeBit: 'text-3xl font-bold text-blue-500 hover:text-blue-400 transition-colors',
	titleSection: 'text-2xl font-bold text-gray-800 dark:text-white',
};
