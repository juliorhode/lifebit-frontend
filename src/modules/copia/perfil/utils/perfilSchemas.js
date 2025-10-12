/**
 * @description Centraliza los esquemas de validación de Yup para el módulo de Perfil.
 * Mantener los esquemas en un archivo separado dentro del módulo mejora la organización
 * y la cohesión, permitiendo que la lógica de validación sea reutilizable dentro
 * del propio módulo si fuera necesario en el futuro.
 */
import * as yup from 'yup';

/**
 * @description Esquema de validación para el formulario de edición de perfil de usuario.
 * Define las reglas de negocio para los campos que el usuario puede modificar.
 */
export const perfilSchema = yup.object().shape({
	nombre: yup
		.string()
		.required('El nombre es obligatorio.')
		.matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras.')
		.min(2, 'El nombre debe tener al menos 2 caracteres.'),
	apellido: yup
		.string()
		.required('El apellido es obligatorio.')
		.matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras.')
		.min(2, 'El apellido debe tener al menos 2 caracteres.'),
	cedula: yup
		.string()
		.notRequired()
		.nullable() // Permite que el valor sea null o una cadena vacía.
		.matches(/^[VEJvej]\d{7,9}$/, {
			message: 'Formato inválido. Use V, E o J seguido de 7 a 9 números.',
			excludeEmptyString: true,
		}),
	telefono: yup
		.string()
		.notRequired()
		.nullable()
		.matches(/^(\+58|0)\d{10}$/, {
			message: 'Formato inválido. Use 04XX1234567 o +584XX1234567.',
			excludeEmptyString: true,
		}),
});
