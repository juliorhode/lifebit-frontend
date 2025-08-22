import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiService from '../../services/apiService';
import Spinner from '../ui/Spinner';
import { STYLES } from '../../utils/styleConstants';

// 1. Esquema de validación específico para este formulario.
const schema = yup.object().shape({
    email: yup
        .string()
        .email('Por favor, introduce un correo electrónico válido.')
        .min(6, 'El correo electrónico debe tener al menos 5 caracteres.')
        .max(254, 'El correo electrónico debe tener como máximo 100 caracteres.')
        .required('El correo electrónico es obligatorio.'),
});

/**
 * Componente de formulario para solicitar el restablecimiento de contraseña.
 * Contiene toda la lógica de validación y envío de la petición.
 * 
 * @returns {JSX.Element} El formulario de contraseña olvidada.
 */
// Recibe una función para notificar al componente padre si el formulario está procesando
const ForgotPasswordForm = ({ onProcessingChange }) => {
    // Estados para manejar la comunicación con la API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Hooks de React Hook Form
    const {
        register, // Registra los campos del formulario
        handleSubmit, // Maneja el envío del formulario0
        formState: { errors }, // Captura los errores de validación
    } = useForm({
        resolver: yupResolver(schema), // Usamos yup para la validación del formulario
        mode: 'onChange' // Valida en cada cambio para feedback instantáneo
    });
    
    // Actualiza el estado de procesamiento en el componente padre
    useEffect(() => {
        onProcessingChange(loading); // Notifica al componente padre si está procesando
    }, [loading, onProcessingChange]); // Dependencia en 'loading' para actualizar el estado

    // Función que se ejecuta al enviar el formulario (si es válido)
    const onSubmit = async (data) => {
        setLoading(true); // Indicamos que estamos procesando
        setError(''); // Limpiamos cualquier error previo
        setSuccess(''); // Limpiamos el mensaje de éxito previo

        // Creamos una promesa de demora para el Spinner (desarroollo/UX)
        const delay = new Promise(resolve => setTimeout(resolve, 10000)); // 2000 milisegundos = 2 segundos
        
        try {
            // Esto asegura que el spinner se muestre durante al menos 2 segundos. (desarroollo/UX)
            await delay 

            // Usamos nuestro servicio de API para llamar al endpoint del backend.
            const response = await apiService.post('/auth/forgot-password', data);

            // Usamos el mensaje de éxito que nos devuelve el backend.
            setSuccess(response.data.message);

        } catch (err) {
            setError(err.response?.data?.error?.mensaje || 'Ha ocurrido un error. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Si la petición fue exitosa, mostramos solo el mensaje de éxito.
    if (success) {
        return (
            <div className="text-center">
                <p className="text-green-700 dark:text-green-400">{success}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div>
                <label htmlFor="email" className={STYLES.label}>Correo Electrónico</label>
                <input
                    type="email"
                    {...register("email")} // Registra el campo 'email' con React Hook Form
                    className={STYLES.input} // Aplica los estilos definidos
                    autoFocus // Para que el cursor aparezca aquí al abrir el modal
                />
                {/* Muestra el error de validación si existe */}
                {errors.email && <p className={STYLES.errorText}>{errors.email.message}</p>}
                {/* Muestra el error de la API si existe */}
                {error && <p className={STYLES.errorText}>{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading} // Deshabilita el botón si está cargando
                className={STYLES.buttonPrimary} // Aplica los estilos del botón primario
            >
                {/* El texto del botón cambia según el estado. Mostramos un Spinner si está cargando. */}
                {loading ? <Spinner type="ring3" /> : 'Restablecer'}
            </button>
        </form>
    );
};

export default ForgotPasswordForm;
