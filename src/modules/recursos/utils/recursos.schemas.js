import * as yup from 'yup';

/**
 * @file Este archivo centraliza todos los esquemas de validación de `yup` para el módulo de Recursos.
 * Tenerlos en un solo lugar facilita el mantenimiento y la reutilización.
 */

// --- Constantes para Validación de Archivos ---

/** @type {number} Tamaño máximo del archivo en Megabytes para la carga de inventario. */
const MAX_FILE_SIZE_MB_EXCEL = 5;
/** @type {number} Tamaño máximo del archivo en Bytes, calculado a partir de la constante en MB. */
const MAX_FILE_SIZE_BYTES_EXCEL = MAX_FILE_SIZE_MB_EXCEL * 1024 * 1024;
/** @type {Array<string>} Lista de tipos MIME aceptados para los archivos de Excel. */
const SUPPORTED_FORMATS_EXCEL = [
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
	'application/vnd.ms-excel', // .xls
];

/**
 * @description Convierte un string a formato "Title Case".
 * Ej: "hola mundo" -> "Hola Mundo"
 */
export const toTitleCase = (str) => {
	if (!str) return str;
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
};

/**
 * @description Esquema de validación para el formulario de creación en lote de Tipos de Recurso (`CrearTipoRecursoModal`).
 * Valida un array de objetos, donde cada objeto debe tener un nombre y un tipo válidos.
 */
export const tipoRecursoSchema = yup.object().shape({
	// El campo principal es un array llamado 'tipos'.
	tipos: yup
		.array()
		.of(
			// Cada objeto dentro del array debe cumplir con esta forma.
			yup.object().shape({
				nombre: yup
					.string()
					.trim()
					.required('El nombre es requerido.')
					.transform(toTitleCase),
				tipo: yup
					.string()
					.oneOf(['asignable', 'inventario'], 'El tipo no es válido.') // Solo permite estos dos valores.
					.required('Debes seleccionar un tipo.'),
			})
		)
		.min(1, 'Debes añadir al menos un tipo de recurso.'), // El array no puede estar vacío.
});

/**
 * @description Esquema de validación para el formulario del Generador de Inventario Secuencial (`GeneradorInventarioModal`).
 * Valida que la cantidad y el número de inicio sean números enteros positivos.
 */
export const generadorInventarioSchema = yup.object().shape({
	cantidad: yup
		.number()
		.typeError('La cantidad debe ser un número.')
		.integer('Debe ser un número entero.')
		.min(1, 'Debes generar al menos 1 item.')
		.required('La cantidad es obligatoria.'),

	numeroInicio: yup
		.number()
		.typeError('El número de inicio debe ser un número.')
		.integer('Debe ser un número entero.')
		.min(1, 'El número de inicio no puede ser menor que 1.')
		.required('El número de inicio es obligatorio.'),
});

/**
 * @description Esquema de validación para el formulario de carga de archivo de inventario (`CargarArchivoModal`).
 * Valida la presencia, tamaño y tipo de archivo.
 */
export const cargaInventarioSchema = yup.object().shape({
	// El campo se llama 'archivoInventario' y es de tipo `mixed` porque trata con objetos `File`.
	archivoInventario: yup
		.mixed()
		.required('Debes seleccionar un archivo.')
		// Test para asegurar que el array de archivos no esté vacío.
		.test('filePresent', 'Debes seleccionar un archivo.', (value) => value && value.length > 0)
		// Test para validar el tamaño del archivo.
		.test(
			'fileSize',
			`El archivo es demasiado grande (máximo ${MAX_FILE_SIZE_MB_EXCEL} MB).`,
			(value) => value && value[0] && value[0].size <= MAX_FILE_SIZE_BYTES_EXCEL
		)
		// Test para validar el tipo MIME del archivo.
		.test(
			'fileType',
			'Formato no soportado. Solo se permiten archivos Excel (.xlsx, .xls).',
			(value) => value && value[0] && SUPPORTED_FORMATS_EXCEL.includes(value[0].type)
		),
});

/**
 * @description Esquema de validación para el formulario de edición de un único Tipo de Recurso.
 * Valida un objeto simple con 'nombre' y 'tipo'.
 */
export const editarTipoRecursoSchema = yup.object().shape({
	nombre: yup
		.string()
		.trim()
		.min(3, 'El nombre debe tener al menos 3 caracteres.')
		.required('El nombre es requerido.')
		.transform(toTitleCase),
	tipo: yup
		.string()
		.oneOf(['asignable', 'inventario'], 'El tipo seleccionado no es válido.')
		.required('Debes seleccionar un tipo.'),
});


