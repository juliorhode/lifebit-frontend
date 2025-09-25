// Importamos la librería 'yup', que es nuestro constructor de esquemas de validación.
// El alias 'yup' es una convención estándar en la comunidad de JavaScript.
import * as yup from 'yup';

/**
 * @description Define el esquema de validación para el formulario de un residente.
 * 
 * Este objeto centraliza todas las reglas de negocio para los datos de un residente,
 * asegurando consistencia a través de toda la aplicación (ej. creación, edición).
 * Es utilizado por `yupResolver` en `react-hook-form` para validar los campos del formulario.
 */
export const residenteSchema = yup.object().shape({
    // --- CAMPO NOMBRE ---
    nombre: yup
        .string() // Debe ser una cadena de texto.
        .required('El nombre es obligatorio') // No puede estar vacío.
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios') // Validación con Expresión Regular (Regex) para asegurar formato.
        .min(3, 'El nombre debe tener al menos 3 caracteres') // Longitud mínima.
        .max(100, 'El nombre no puede exceder 100 caracteres'), // Longitud máxima.

    // --- CAMPO APELLIDO ---
    apellido: yup
        .string()
        .required('El apellido es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
        .min(3, 'El apellido debe tener al menos 3 caracteres')
        .max(100, 'El apellido no puede exceder 100 caracteres'),

    // --- CAMPO EMAIL ---
    email: yup
        .string()
        .required('El email es obligatorio')
        .email('Ingresa un email válido') // Validación de formato de email incorporada en yup.
        .max(255, 'El email es demasiado largo'),

    // --- CAMPO CÉDULA (OPCIONAL) ---
    cedula: yup
        .string()
        .notRequired() // Indica que el campo no es obligatorio.
        // `.test()` permite crear validaciones personalizadas.
        .test(
            'cedula-format', // Nombre del test.
            'Formato inválido. Use: V12345678, E12345678 o J12345678', // Mensaje de error.
            (value) => {
                // Si el valor es nulo, indefinido o una cadena vacía, la validación pasa (es opcional).
                if (!value || value.trim() === '') return true; 
                // Regex que valida que empiece por V, E o J (mayúscula o minúscula) seguido de 7 u 8 dígitos.
                return /^[VEJve]\d{7,8}$/.test(value);
            }
        ),

    // --- CAMPO TELÉFONO (OPCIONAL) ---
    telefono: yup
        .string()
        .notRequired()
        .test(
            'telefono-format',
            'Formato inválido. Use: 02124763979 o +584142075076',
            (value) => {
                if (!value || value.trim() === '') return true;
                // Regex que permite formatos venezolanos: 0XXXXXXXXXX o +58XXXXXXXXXX.
                // `.replace(/\s+/g, '')` elimina espacios en blanco antes de validar.
                const telefonoRegex = /^(\+58|0)\d{10}$/;
                return telefonoRegex.test(value.replace(/\s+/g, ''));
            }
        ),
    
    // --- CAMPO UNIDAD ---
    unidad_id: yup
        .string()
        .required('Debes seleccionar una unidad') // Es obligatorio seleccionar una de la lista.
        .min(1, 'Selecciona una unidad válida'), // Asegura que no sea una cadena vacía.
});