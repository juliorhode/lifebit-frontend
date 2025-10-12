/**
 * @description Hook especializado que gestiona toda la lógica de negocio para la sección de seguridad del perfil.
 * Se encarga de interactuar con el estado global (`authStore`), determinar el estado de vinculación
 * de cuentas de terceros y manejar las llamadas a la API para acciones como vincular/desvincular.
 *
 * RESPONSABILIDADES:
 * ✅ Leer el estado del usuario desde `authStore`.
 * ✅ Determinar si la cuenta está vinculada con proveedores externos (ej. Google).
 * ✅ Contener la lógica asíncrona para desvincular una cuenta, incluyendo el manejo de estados
 *    de carga, éxito y error.
 * ✅ Orquestar la re-sincronización del estado global del usuario tras una acción exitosa.
 * ✅ Exponer una API simple de datos y funciones para que el componente de la UI sea puramente presentacional.
 *
 * @returns {object} Un objeto con el estado y los manejadores necesarios para la UI.
 */
import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useSeguridadPerfil = () => {
	// --- ESTADO Y ACCIONES GLOBALES ---
	// Se extraen los valores del store de Zustand de forma individual.
	// Esto previene un bucle infinito de re-renderizados, ya que cada selector
	// devuelve un valor primitivo o una referencia estable (objeto/función),
	// evitando la creación de un nuevo objeto en cada render.
	const usuario = useAuthStore((state) => state.usuario);
	const getProfile = useAuthStore((state) => state.getProfile);

	// --- ESTADO LOCAL ---
	// `isSubmitting` controla el estado de carga para las acciones de este hook (ej. Desvinculando...).
	const [isSubmitting, setIsSubmitting] = useState(false);
	// Estado para controlar la visibilidad del modal de confirmación.
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	// --- DATOS DERIVADOS ---
	// Se determina si la cuenta está vinculada a Google verificando la existencia
	// de la propiedad `google_id` en el objeto de usuario.
	// El operador `!!` (doble negación) convierte un valor a booleano:
	// - Si `usuario.google_id` es un string (ej. '12345...'), `!!` lo convierte a `true`.
	// - Si `usuario.google_id` es `null`, `!!` lo convierte a `false`.
	// `useMemo` asegura que este cálculo solo se realice cuando el objeto `usuario` cambie.
	const isGoogleLinked = useMemo(() => !!usuario?.google_id, [usuario]);

	// --- MANEJADORES DE MODAL ---

	/**
	 * @description Abre el modal de confirmación para desvincular.
	 */
	const openConfirmModal = () => {
		setIsConfirmModalOpen(true);
	};

	/**
	 * @description Cierra el modal de confirmación.
	 */
	const closeConfirmModal = () => {
		// Solo permitimos cerrar si no hay una operación en curso.
		if (!isSubmitting) {
			setIsConfirmModalOpen(false);
		}
	};

	// --- MANEJADORES DE ACCIONES (Lógica de Negocio) ---

	/**
	 * @description Maneja el proceso completo de desvinculación de la cuenta de Google.
	 * Incluye confirmación del usuario, llamada a la API, manejo de estados y feedback visual.
	 */
	const handleDesvincular = async () => {
		setIsSubmitting(true);
		const toastId = toast.loading('Desvinculando tu cuenta de Google...');
		try {
			// Se llama al endpoint del backend. La lógica de negocio crítica (ej. verificar si
			// el usuario tiene una contraseña) reside de forma segura en el servidor.
			await apiService.post('/perfil/google/desvincular');

			// Cerramos el modal ANTES de mostrar el toast de éxito para una mejor UX.
			closeConfirmModal();

			// CRUCIAL: Tras el éxito, refrescamos el estado global del usuario.
			// Esto hará que el `usuario.provider` cambie, y cualquier componente
			// que dependa de él (como `SeccionSeguridad.jsx`) se re-renderizará
			// automáticamente con la nueva interfaz (ej. mostrando "Vincular").
			await getProfile();

			toast.success('Cuenta de Google desvinculada exitosamente.', { id: toastId });
		} catch (error) {
			// El frontend simplemente muestra el error específico que el backend le envía.
			const errorMessage =
				error.response?.data?.message || 'No se pudo desvincular la cuenta.';
			toast.error(errorMessage, { id: toastId });
		} finally {
			// Nos aseguramos de que el estado de carga siempre se desactive,
			// tanto en caso de éxito como de error.
			setIsSubmitting(false);
		}
	};

	// --- API PÚBLICA DEL HOOK ---
	// Devolvemos un objeto que contiene todo lo que el componente `SeccionSeguridad.jsx` necesita
	// para renderizar la UI y responder a las interacciones del usuario.
	return {
		usuario, // El objeto de usuario para mostrar datos como el email.
		isGoogleLinked, // El booleano que controla qué interfaz mostrar.
		isSubmitting, // El estado de carga para deshabilitar botones.
		isConfirmModalOpen, // Estado para controlar la visibilidad del modal.
		openConfirmModal, // Función para abrir el modal.
		closeConfirmModal, // Función para cerrar el modal.
		handleDesvincular, // La función para conectar al botón de "Desvincular".
	};
};
