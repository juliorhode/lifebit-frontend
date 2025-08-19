/** @type {import('tailwindcss').Config} */
export default {
	// Le decimos qué archivos debe mirar para encontrar clases de Tailwind.
	// Esto es crucial para que Tailwind sepa qué CSS generar.
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

	// Activamos el modo oscuro usando la estrategia de 'class'.
	// Cuando el tag <html> tiene la clase 'dark', se aplicarán los estilos oscuros.
	darkMode: 'class',

	// Aquí podríamos personalizar el tema, pero por ahora lo dejamos por defecto.
	theme: {
		extend: {},
	},

	// Aquí podríamos añadir plugins, pero por ahora no necesitamos ninguno.
	plugins: [],
};
