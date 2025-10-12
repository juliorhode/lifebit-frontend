/**
 * @description Hook especializado para gestionar el formulario de edición del perfil de usuario.
 * Encapsula la lógica de estado, validación y envío de datos a la API, manteniendo
 * el componente de la interfaz limpio y centrado en la presentación.
 *
 * RESPONSABILIDADES:
 * ✅ Gestionar los campos del formulario (nombre, apellido, etc.) con `react-hook-form`.
 * ✅ Validar los datos del formulario con un esquema de Yup.
 * ✅ Inicializar el formulario con los datos actuales del usuario provenientes del `authStore`.
 * ✅ Manejar el estado de envío (isSubmitting) para dar feedback al usuario.
 * ✅ Orquestar la llamada a la API (`PATCH /api/perfil/me`) para actualizar los datos.
 * ✅ Sincronizar el estado global de la aplicación (`authStore`) tras una actualización exitosa.
 *
 * @param {object} usuarioActual - El objeto de usuario actual del `authStore`, usado para los valores por defecto.
 * @param {function} onUpdateSuccess - Callback a ejecutar cuando el perfil se actualiza exitosamente.
 * @returns {object} La API pública del hook para ser usada por el componente del formulario.
 */
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthStore } from '../../../store/authStore';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import { perfilSchema } from '../utils/perfilSchemas';


export const usePerfilForm = (usuarioActual, onUpdateSuccess) => {
    // Obtenemos la acción `getProfile` del authStore. La necesitaremos para
    // refrescar el estado global después de una actualización exitosa.
    const getProfile = useAuthStore(state => state.getProfile);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset, // Necesitaremos `reset` para cancelar la edición.
    } = useForm({
        resolver: yupResolver(perfilSchema),
        // Los valores por defecto del formulario se toman del objeto de usuario
        // que pasamos como parámetro. Esto puebla el formulario cuando se inicializa.
        defaultValues: {
            nombre: usuarioActual?.nombre || '',
            apellido: usuarioActual?.apellido || '',
            cedula: usuarioActual?.cedula || '',
            telefono: usuarioActual?.telefono || '',
        },
        mode: 'onChange',
    });

    /**
     * @description Lógica que se ejecuta al enviar el formulario válido.
     * @param {object} formData - Los datos del formulario ya validados por Yup.
     */
    const onSubmit = async (formData) => {
        const toastId = toast.loading('Actualizando tu perfil...');
        try {
            // Llamamos al endpoint del backend para actualizar el perfil.
            await apiService.patch('/perfil/me', formData);
            
            // CRUCIAL: Después de una actualización exitosa en la base de datos,
            // le pedimos al authStore que vuelva a buscar el perfil del usuario.
            // Esto asegura que toda la aplicación (incluido el Header) refleje
            // los nuevos datos de forma consistente.
            await getProfile();

            toast.success('Perfil actualizado exitosamente.', { id: toastId });

            // Notificamos al componente que el proceso fue exitoso,
            // para que pueda, por ejemplo, cambiar de nuevo al modo de "vista".
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'No se pudo actualizar el perfil.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    /**
     * @description Restaura el formulario a sus valores originales, descartando cualquier cambio.
     */
    const cancelarEdicion = () => {
        reset({
            nombre: usuarioActual?.nombre || '',
            apellido: usuarioActual?.apellido || '',
            cedula: usuarioActual?.cedula || '',
            telefono: usuarioActual?.telefono || '',
        });
    };

    // Devolvemos todas las herramientas que el componente de la interfaz necesitará.
    return {
		register,
		handleSubmit: handleSubmit(onSubmit),
		errors,
		isSubmitting,
		isDirty, // `isDirty` es útil para saber si el botón "Guardar" debe habilitarse.
		cancelarEdicion,
		reset, // Exponemos 'reset' para que el componente pueda llamarlo directamente.
	};
};