/**
 * @file useCambiarEmail.js
 * @description Hook especializado para gestionar el flujo de cambio de correo electrónico.
 * Esta es la pieza central de la lógica, el "cerebro" que orquesta el proceso.
 * Sigue nuestro patrón "Hook-Centric Façade", encapsulando toda la complejidad para que
 * el componente de la UI sea simple y declarativo.
 *
 * @param {object} options - Opciones de configuración para el hook.
 * @param {function} options.onSuccess - Callback a ejecutar cuando el flujo se completa.
 * @returns {object} La API pública del hook para ser usada por la UI.
 */
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { verificarPasswordSchema, nuevoEmailSchema } from '../utils/perfilSchemas';
import apiService from '../../../services/apiService';

// Definimos los pasos como constantes para evitar "magic strings" en el código.
// Esto hace el código más legible y fácil de mantener. Si necesitamos añadir un paso,
// solo lo modificamos aquí.
const PASOS = {
	VERIFICAR_PASS: 1,
	INGRESAR_EMAIL: 2,
	CONFIRMACION_ENVIADA: 3,
};

export const useCambiarEmail = ({ onSuccess }) => {
	// --- ESTADO INTERNO DEL HOOK ---
	// `pasoActual` controla qué parte de la UI se muestra en el modal.
	const [pasoActual, setPasoActual] = useState(PASOS.VERIFICAR_PASS);
	// `isSubmitting` nos permite deshabilitar botones y mostrar spinners durante las llamadas a la API.
	const [isSubmitting, setIsSubmitting] = useState(false);
	// `errorApi` almacena mensajes de error provenientes del backend.
	const [errorApi, setErrorApi] = useState(null);
	// `emailPendiente` guarda el nuevo email para mostrarlo en el mensaje final de confirmación.
	const [emailPendiente, setEmailPendiente] = useState('');

	// --- INSTANCIAS DE FORMULARIO ---
	// Creamos una instancia de `react-hook-form` para cada paso que requiere entrada del usuario.
	// Cada una está conectada a su propio esquema de validación Yup.
	const formPassword = useForm({
		resolver: yupResolver(verificarPasswordSchema),
		mode: 'onChange', // La validación se ejecuta en cada cambio, dando feedback inmediato.
	});

	const formEmail = useForm({
		resolver: yupResolver(nuevoEmailSchema),
		mode: 'onChange',
	});

	// --- MANEJADORES DE ACCIONES ---

	/**
	 * @description Orquesta el Paso 1: Verificación de la contraseña.
	 * Llama al endpoint `/perfil/verify-password`.
	 * @param {object} data - Datos del formulario, ej: { contraseña: '...' }.
	 */
	const handleVerificarPassword = useCallback(
		async (data) => {
			setIsSubmitting(true);
			setErrorApi(null);
			try {
				await apiService.post('/perfil/verify-password', data);
				setPasoActual(PASOS.INGRESAR_EMAIL);
			} catch (error) {
				const msg = error.response?.data?.message || 'Error al verificar la contraseña.';
				setErrorApi(msg);
				formPassword.setError('contraseña', { type: 'manual', message: msg });
			} finally {
				setIsSubmitting(false);
			}
		},
		[formPassword]
	); // Dependencia: la función se recreará solo si `formPassword` cambia.

	/**
	 * @description Orquesta el Paso 2: Solicitud de cambio de email.
	 * Llama al endpoint `/perfil/request-email-change`.
	 * @param {object} data - Datos del formulario, ej: { nuevoEmail: '...' }.
	 */
	const handleSolicitarCambio = useCallback(
		async (data) => {
			setIsSubmitting(true);
			setErrorApi(null);
			setEmailPendiente(data.nuevoEmail);
			try {
				await apiService.post('/perfil/request-email-change', data);
				setPasoActual(PASOS.CONFIRMACION_ENVIADA);
			} catch (error) {
				const msg = error.response?.data?.message || 'No se pudo procesar la solicitud.';
				setErrorApi(msg);
				formEmail.setError('nuevoEmail', { type: 'manual', message: msg });
			} finally {
				setIsSubmitting(false);
			}
		},
		[formEmail]
	);

	/**
	 * @description Resetea el estado completo del hook a sus valores iniciales.
	 * Es crucial para que el modal funcione correctamente si se cierra y se vuelve a abrir.
	 */
	const resetFlujo = useCallback(() => {
		setPasoActual(PASOS.VERIFICAR_PASS);
		setIsSubmitting(false);
		setErrorApi(null);
		setEmailPendiente('');
		// `reset()` es una función de react-hook-form que limpia los campos y errores del formulario.
		formPassword.reset();
		formEmail.reset();
	}, [formPassword, formEmail]); // Dependencias: `formPassword` y `formEmail`.
	
	/**
	 * @description Maneja el cierre del modal, ya sea por cancelación o al finalizar.
	 */
	const finalizarYcerrar = useCallback(() => {
		// Si el componente padre nos pasó una función `onSuccess`, la llamamos.
		// En nuestro caso, esta función será la que pone `isModalOpen` en `false`.
		if (onSuccess) onSuccess();
		// Esperamos un momento antes de resetear el flujo para permitir que la animación
		// de cierre del modal se complete suavemente.
		setTimeout(resetFlujo, 300);
	}, [onSuccess, resetFlujo]);

	// --- EXPOSICIÓN DE LA API DEL HOOK ---
	// Devolvemos un objeto con todo lo que el componente de la UI necesita para funcionar.
	return {
		// Estado para controlar la UI
		pasoActual,
		isSubmitting,
		errorApi,
		emailPendiente,
		PASOS,
		// Instancias completas de los formularios
		formPassword,
		formEmail,
		// Manejadores ya envueltos por `handleSubmit` para uso directo en `onSubmit`
		handleVerificarPassword,
		handleSolicitarCambio,
		// Funciones de control de flujo
		resetFlujo,
		finalizarYcerrar,
	};
};
