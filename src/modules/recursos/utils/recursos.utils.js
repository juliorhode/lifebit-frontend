/**
 * @file Este archivo contiene funciones de utilidad específicas para el módulo de Recursos.
 * Estas funciones son puras y están diseñadas para ser reutilizables.
 */

/**
 * @description Genera una lista de ejemplos de identificadores basados en un patrón,
 * una cantidad y un número de inicio. Es el "motor" de la previsualización en el generador de inventario.
 *
 * @param {string} pattern - El patrón de nomenclatura (ej. "P-{C}").
 * @param {number} quantity - La cantidad total de items a generar en la simulación.
 * @param {number} startNumber - El número por el que debe empezar el contador.
 * @returns {Array<string>} Un array de strings con los ejemplos generados.
 */
export const generateExamples = (pattern, quantity, startNumber) => {
	// Validación de entrada para asegurar que no se ejecute con datos inválidos o incompletos.
	if (!pattern || isNaN(quantity) || isNaN(startNumber) || quantity < 1) {
		return [];
	}

	const examples = [];
	// Se genera un máximo de 5 ejemplos para no sobrecargar la UI de previsualización.
	const limit = Math.min(quantity, 5);

	for (let i = 0; i < limit; i++) {
		const counter = startNumber + i;

		// Reemplaza cada placeholder de contador con el valor del contador formateado correctamente.
		// El orden es importante: del más específico ({C}) al más general ({c}).
		const example = pattern
			.replace(/{C}/g, String(counter).padStart(3, '0'))    // Contador con padding de 3 ceros (001, 002)
			.replace(/{c_c}/g, String(counter).padStart(2, '0')) // Contador con padding de 2 ceros (01, 02)
			.replace(/{c}/g, counter);                               // Contador sin padding (1, 2)

		examples.push(example);
	}

	return examples;
};