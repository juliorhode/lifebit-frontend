/**
 * @description Hook especializado para gestionar el formulario de edición del perfil de usuario.
 * Encapsula la lógica de estado, validación, envío de datos a la API y la gestión
 * de modales de confirmación, manteniendo el componente de la UI limpio.
 *
 * @param {object} usuarioActual - El objeto de usuario actual del `authStore`.
 * @param {function} onUpdateSuccess - Callback a ejecutar cuando el perfil se actualiza exitosamente.
 * @returns {object} La API pública del hook para ser usada por el componente del formulario.
 */
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthStore } from '../../../store/authStore';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import { perfilSchema } from '../utils/perfilSchemas';

export const usePerfilForm = (usuarioActual, onUpdateSuccess) => {
	const getProfile = useAuthStore((state) => state.getProfile);
	// console.log('Usuario actual en usePerfilForm:', usuarioActual);
	

	// --- ESTADO LOCAL DEL HOOK ---
	// Se guarda una copia "congelada" de los datos iniciales para una detección de cambios fiable.
	const [originalData, setOriginalData] = useState(null);
	// Estado para controlar la visibilidad del modal de confirmación para cancelar.
	const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch, // Se necesita `watch` para la detección de cambios en tiempo real.
	} = useForm({
		resolver: yupResolver(perfilSchema),
		defaultValues: {
			nombre: usuarioActual?.nombre || '',
			apellido: usuarioActual?.apellido || '',
			cedula: usuarioActual?.cedula || '',
			telefono: usuarioActual?.telefono || '',
		},
		mode: 'onChange',
	});

	// Efecto para inicializar el estado `originalData` cuando el usuario carga.
	useEffect(() => {
		if (usuarioActual) {
			const initialData = {
				nombre: usuarioActual.nombre || '',
				apellido: usuarioActual.apellido || '',
				cedula: usuarioActual.cedula || '',
				telefono: usuarioActual.telefono || '',
			};
			setOriginalData(initialData);
			// `reset` asegura que el formulario se pueble con los datos correctos.
			reset(initialData);
		}
	}, [usuarioActual, reset]);

	/**
	 * @description Compara los valores actuales del formulario con los datos originales.
	 * Es más robusto que `isDirty` para detectar cualquier cambio.
	 * @returns {boolean} `true` si ha habido al menos un cambio en el formulario.
	 */
	const hayCambios = useCallback(() => {
		if (!originalData) return false;
		const currentValues = watch();
		// Compara cada campo con su valor original.
		return (
			originalData.nombre !== currentValues.nombre ||
			originalData.apellido !== currentValues.apellido ||
			originalData.cedula !== currentValues.cedula ||
			originalData.telefono !== currentValues.telefono
		);
	}, [originalData, watch]);

	// --- MANEJADORES DE ACCIONES ---

	const onSubmit = async (formData) => {
		const toastId = toast.loading('Actualizando tu perfil...');
		try {
			await apiService.patch('/perfil/me', formData);
			await getProfile();
			toast.success('Perfil actualizado exitosamente.', { id: toastId });
			if (onUpdateSuccess) {
				onUpdateSuccess();
			}
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || 'No se pudo actualizar el perfil.';
			toast.error(errorMessage, { id: toastId });
		}
	};

	const openConfirmCancelModal = () => setIsConfirmCancelOpen(true);
	const closeConfirmCancelModal = () => setIsConfirmCancelOpen(false);

	// --- API PÚBLICA DEL HOOK ---
	return {
		register,
		handleSubmit: handleSubmit(onSubmit),
		errors,
		isSubmitting,
		// En lugar de `isDirty`, exponemos nuestra función de detección de cambios más fiable.
		hayCambios: hayCambios(),
		// Funciones y estado para que el componente controle el modal de cancelación.
		isConfirmCancelOpen,
		openConfirmCancelModal,
		closeConfirmCancelModal,
		// Exponemos `reset` para que el componente pueda descartar los cambios tras la confirmación.
		reset,
	};
};
