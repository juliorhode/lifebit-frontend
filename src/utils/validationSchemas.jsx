import * as yup from 'yup';

/**
 * @description Convierte un string a formato "Title Case".
 * Ej: "hola mundo" -> "Hola Mundo"
 * @param {string} str - El string de entrada.
 * @returns {string} El string capitalizado.
 */
const toTitleCase = (str) => {
	if (!str) return str;
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
};

// --- Constantes para la validación de archivos ---
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 5 MB

const SUPPORTED_FORMATS_CEDULA = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const SUPPORTED_FORMATS_DOCUMENTO = ['application/pdf'];


// --- Esquema de Validación para el Formulario de Solicitud de Servicio ---
const solicitudSchema = yup.object().shape({
	// Nombre del Solicitante: Requerido y se transforma a Title Case.
	nombre_solicitante: yup
		.string() 
		.matches(/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras.')
		.min(3, 'El nombre debe tener al menos 3 caracteres.')
		.max(50, 'El nombre debe tener como máximo 50 caracteres.')
		.transform(toTitleCase)
		.required('El nombre es obligatorio.'),

	// Apellido del Solicitante: Requerido y se transforma a Title Case.
	apellido_solicitante: yup
		.string()
		.matches(/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras.')
		.min(3, 'El apellido debe tener al menos 3 caracteres.')
		.max(50, 'El nombre debe tener como máximo 50 caracteres.')
		.transform(toTitleCase)
		.required('El apellido es obligatorio.'),

	// Email: Requerido y debe tener un formato de email válido.
	email_solicitante: yup
		.string()
		.email('Por favor, introduce un correo electrónico válido.')
		.min(6, 'El correo electrónico debe tener al menos 6 caracteres.')
		.max(254, 'El correo electrónico debe tener como máximo 100 caracteres.')
		.required('El correo electrónico es obligatorio.'),

	// Teléfono: No es requerido, pero si se introduce, debe cumplir el formato.
	telefono_solicitante: yup.string().matches(/^[0-9]{10,11}$/, {
		message: 'Debe ser un número de 10 u 11 dígitos, sin espacios ni guiones.',
		excludeEmptyString: true, // Permite que el campo esté vacío
		
	}),

	// Cédula/RIF: No es requerido, pero si se introduce, debe cumplir el formato.
	cedula_solicitante: yup
		.string()
		.matches(/^[VEJvej][0-9]{7,9}$/, {
			// Ajustado a V/E/J + 7 a 9 dígitos
			message: 'El formato debe ser V, E o J seguido de 7 a 9 números.',
			excludeEmptyString: true,
		})
		.transform((value) => (value ? value.toUpperCase() : value)), // Transforma a mayúsculas

	// Nombre del Edificio: Requerido y se transforma a Title Case.
	nombre_edificio: yup
		.string()
		.transform(toTitleCase)
		.min(2, 'El nombre del edificio debe tener al menos 2 caracteres.')
		.max(50, 'El nombre del edificio debe tener como máximo 50 caracteres.')
		.required('El nombre del edificio es obligatorio.'),

	// Dirección del Edificio: Opcional, pero se transforma a Title Case si se introduce.
	direccion_edificio: yup
		.string()
		.min(10, 'La dirección del edificio debe tener al menos 10 caracteres.')
		.max(255, 'La dirección del edificio debe tener como máximo 100 caracteres.')
		.transform(toTitleCase),

	// Plan (Licencia): Requerido.
	//id_licencia_solicitada: yup.string().required('Debes seleccionar un plan.'),

	archivo_cedula: yup
		.mixed()
		.test(
			'fileSize',
			`Máximo ${MAX_FILE_SIZE_MB} MB`,
			(value) => !value || value.length === 0 || value[0].size <= MAX_FILE_SIZE_BYTES
		)
		.test(
			'fileType',
			'Solo JPG, PNG o PDF',
			(value) =>
				!value || value.length === 0 || SUPPORTED_FORMATS_CEDULA.includes(value[0].type)
		),

	documento_condominio: yup
		.mixed()
		.test(
			'fileSize',
			`Máximo ${MAX_FILE_SIZE_MB} MB`,
			(value) => !value || value.length === 0 || value[0].size <= MAX_FILE_SIZE_BYTES
		)
		.test(
			'fileType',
			'Solo se permite PDF',
			(value) =>
				!value || value.length === 0 || SUPPORTED_FORMATS_DOCUMENTO.includes(value[0].type)
		),
});

const resetPasswordSchema = yup.object().shape({
	// Nueva Contraseña: Requerida y con un mínimo de 8 caracteres.
	// Podríamos añadir más reglas aquí en el futuro (ej. requerir mayúsculas, números, etc.)
	// con el método .matches(). Por ahora, la longitud es una excelente primera defensa.
	password: yup
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres.')
		.required('La nueva contraseña es obligatoria.'),

	// Confirmar Contraseña: Requerida y debe coincidir con el campo 'password'.
	confirmPassword: yup
		.string()
		.oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir.')
		.required('Debes confirmar la contraseña.'),
	// El valor de este campo debe ser uno de (oneOf) los siguientes: el valor del campo que se llama 'password' (yup.ref('password')). Si no lo es, muestra el mensaje de error 'Las contraseñas no coinciden
});

// resetPasswordSchema.shape({ ... }) le indica a Yup que extienda de resetPasswordSchema y añada un nuevo campo que en nuestro caso es 'passwordActual'.
const updatePasswordSchema = resetPasswordSchema.shape({
	passwordActual: yup
		.string()
		.required('Debes ingresar tu contraseña actual.'),
});

// --- Esquema de Validación para el Formulario de Configuración de Unidades ---
const unidadesFormSchema = yup.object().shape({
	totalPisos: yup.number().typeError('Debe ser un número').min(1, 'Debe haber al menos 1 nivel.').required('Campo requerido.'),
	unidadesPorDefecto: yup.number().typeError('Debe ser un número').min(1, 'Debe haber al menos 1 unidad.').required('Campo requerido.'),
	alicuotaPorDefecto: yup.number().typeError('Debe ser un número').min(0, 'No puede ser negativo.').max(100, 'No puede ser mayor a 100.'),
	excepciones: yup.array().of(yup.object().shape({
		piso: yup.number().typeError('Debe ser un número').required(),
		cantidad: yup.number().typeError('Debe ser un número').required(),
	})),
});

export {
	solicitudSchema,
	resetPasswordSchema,
	updatePasswordSchema,
	unidadesFormSchema,
};

