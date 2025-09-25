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
	backgroundPage: 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200',
	backgroundCard: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200',

	// --- INPUTS Y FORMULARIOS ---
	input: 'w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white',
	label: 'block text-left text-sm font-semibold mb-2 text-gray-600 dark:text-gray-200',
	// errorText: 'text-red-500 dark:text-red-400 text-xs mt-1',
	errorText: 'bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md',
	successText: 'bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md',
	inputFile: 'w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100',

	// --- BOTONES ---
	buttonPrimary:
		'w-full h-[54px] flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed',
	buttonPrimaryAuto: 'h-[52px] flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed',
	
	buttonSecondary:'px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 rounded-md whitespace-nowrap',

	buttonCancel: 'w-[95px] h-[50px] flex justify-center items-center bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text- transition-colors disabled:bg-red-800 disabled:cursor-not-allowed',
	buttonGoogle:
		'w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors',
	buttonLink: 'text-sm text-blue-500 hover:underline focus:outline-none',

	// --- TARJETAS Y CONTENEDORES ---
	card: 'bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-lg',

	// --- TEXTOS ---
	titlePage: 'text-3xl font-bold text-gray-900 dark:text-white',
	lifeBit: 'text-3xl font-bold text-blue-500 hover:text-blue-400 transition-colors',
	titleSection: 'text-2xl font-bold text-gray-700 dark:text-white',

	// --- LISTAS ---
	selectableListItem: {
		base: 'w-full text-left p-3 rounded-md transition-colors duration-150 text-lg',
		active: 'bg-blue-600 text-white font-semibold',
		inactive: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
	},

	// --- COMPONENTES DRAG-AND-DROP ---
	dnd: {
		paletteContainer: 'p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3',
		paletteTitle: 'font-semibold text-gray-700 dark:text-white',
		block: 'p-2 px-4 rounded-md cursor-grab bg-blue-900 text-blue-100 border border-blue-700',

		canvasBase: 'p-4 rounded-lg border-2 border-dashed transition-all duration-200',
		canvasDefault: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
		canvasHover: 'bg-blue-900/50 border-blue-500 scale-[1.02]',
		canvasContent: 'flex flex-wrap gap-2 min-h-[60px] items-center',
		canvasPlaceholder: 'w-full flex flex-col items-center justify-center text-gray-500 py-4',
	},
};



// SVG del icono de Google
export const ASSETS = {
	googleIconSVG: (
		<svg
			className='w-6 h-6'
			viewBox='0 0 48 48'
		>
			<path
				fill='#EA4335'
				d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
			></path>
			<path
				fill='#4285F4'
				d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
			></path>
			<path
				fill='#FBBC05'
				d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
			></path>
			<path
				fill='#34A853'
				d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
			></path>
			<path
				fill='none'
				d='M0 0h48v48H0z'
			></path>
		</svg>
	),


};
