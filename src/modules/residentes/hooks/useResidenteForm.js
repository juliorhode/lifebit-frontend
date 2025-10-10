/**
 * @description Hook especializado que encapsula la lógica del formulario de creación/edición de residentes.
 * Este hook ha sido refactorizado para seguir el principio de Responsabilidad Única. Ya no se encarga
 * de la obtención de datos (como la lista de unidades) ni de la manipulación directa de borradores
 * en localStorage. Su única misión es gestionar el estado, la validación y los eventos del formulario.
 *
 * ARQUITECTURA "CONTROLLED HOOK":
 * Este hook ahora opera como un "hook controlado". Esto significa que no tiene estado propio
 * sobre los datos de la aplicación, sino que los recibe como parámetros (props) y notifica
 * al exterior sobre los eventos (como guardar un borrador o enviar el formulario) a través de callbacks.
 *
 * RESPONSABILIDADES:
 * ✅ Gestionar los campos del formulario con `react-hook-form`.
 * ✅ Validar los datos en tiempo real usando el esquema de Yup.
 * ✅ Poblar el formulario con datos iniciales para edición o para continuar un borrador.
 * ✅ Llamar a las funciones `onSuccess` o `onGuardarBorrador` para delegar las acciones
 *    al hook principal (`useGestionResidentes`).
 *
 * @param {Object} options - Opciones de configuración del hook.
 * @param {Function} options.onSuccess - Callback a ejecutar tras un envío exitoso.
 * @param {Function} options.onGuardarBorrador - Callback para notificar que se debe guardar un borrador.
 * @param {Object | null} options.residenteEditando - Datos del residente para poblar el formulario en modo edición.
 * @param {Object | null} options.initialData - Datos de un borrador para precargar el formulario.
 * @param {Array} options.unidadesDisponibles - La lista de unidades disponibles, provista por el hook principal.
 * @returns {Object} La API pública del hook para ser usada por el componente del formulario.
 */
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { residenteSchema } from '../utils/residentes.schemas';
import * as utils from '../utils/residentes.utils';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useResidenteForm = ({
	onSuccess,
	onGuardarBorrador,
	residenteEditando = null,
	initialData = null,
	unidadesDisponibles = [],
}) => {
	// =================================================================
	// GESTIÓN DEL FORMULARIO CON REACT-HOOK-FORM
	// =================================================================
	// Se introduce un estado para mantener una copia "congelada" de los datos originales.
	// Esto es crucial para nuestra nueva lógica de detección de cambios, que es más fiable que `isDirty`.
	const [originalData, setOriginalData] = useState(null);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isDirty, isSubmitting }, // Mantenemos isDirty por si es útil en el futuro
		setValue,
		reset,
	} = useForm({
		// El resolver conecta `react-hook-form` con nuestro esquema de validación `yup`.
		// Automáticamente validará los campos del formulario contra las reglas que definimos.
		resolver: yupResolver(residenteSchema),
		// Los valores por defecto se establecen en el montaje inicial.
		defaultValues: residenteEditando || initialData || {},
		// La validación 'onChange' proporciona feedback al usuario mientras escribe.
		mode: 'onChange',
	});

	// =================================================================
	// EFECTOS SECUNDARIOS (SINCRONIZACIÓN CON EL EXTERIOR)
	// =================================================================

	// La carga de unidades las recibe como una prop (`unidadesDisponibles`), lo que simplifica
	// enormemente su lógica y elimina una llamada redundante a la API.

	// Este efecto se encarga de poblar el formulario cuando los datos para edición
	// o de un borrador están disponibles. Es crucial porque `defaultValues` solo
	// funciona en el primer render, y estos datos pueden llegar después.
	useEffect(() => {
		const dataToLoad = residenteEditando || initialData;
		if (dataToLoad) {
			// Se estandariza el objeto de datos que se usará para poblar el formulario.
			const formData = {
				id: dataToLoad.id || null,
				nombre: dataToLoad.nombre || '',
				apellido: dataToLoad.apellido || '',
				email: dataToLoad.email || '',
				cedula: dataToLoad.cedula || '',
				telefono: dataToLoad.telefono || '',
				unidad_id: dataToLoad.numero_unidad || dataToLoad.unidad_id || '',
			};
			reset(formData);
			// Se guarda una copia "congelada" de los datos originales para detectar cambios.
			setOriginalData(formData);

			// NOTA IMPORTANTE:
			// Se puebla el formulario con los datos recibidos (sea de un borrador o de un residente a editar).
			// `reset` actualiza los valores y también el estado `isDirty` de react-hook-form.
			// reset({
			// 	// Si estamos cargando un borrador, su ID único se mantiene en el estado del formulario.
			// 	// Esto es CRUCIAL para que al volver a guardar, se sepa que es una actualización.
			// 	// Mantenemos el ID del borrador si existe, para poder guardarlo de nuevo.
			// 	id: dataToLoad.id || null,
			// 	nombre: dataToLoad.nombre || '',
			// 	apellido: dataToLoad.apellido || '',
			// 	email: dataToLoad.email || '',
			// 	cedula: dataToLoad.cedula || '',
			// 	telefono: dataToLoad.telefono || '',
			// 	// Para edición, usamos `numero_unidad`, para borradores `unidad_id`.
			// 	// Esto unifica el campo que usará el select del formulario.
			// 	unidad_id: dataToLoad.numero_unidad || dataToLoad.unidad_id || '',
			// });
		}
	}, [residenteEditando, initialData, reset]);

	// =================================================================
	// LÓGICA DE NEGOCIO Y MANEJADORES DE EVENTOS
	// =================================================================

	/**
	 * @description Lógica que se ejecuta al enviar el formulario válido.
	 * Construye el payload y llama al endpoint correspondiente de la API.
	 * @param {Object} data - Los datos del formulario validados.
	 */
	const onSubmitLogic = async (data) => {
		try {
			// Construimos el objeto `payload` solo con los campos que el backend espera,
			// evitando enviar campos extra del formulario.
			const payload = {
				nombre: data.nombre,
				apellido: data.apellido,
				email: data.email,
				// Usamos el operador "spread condicional" para añadir campos opcionales solo si tienen valor.
				...(data.cedula && { cedula: data.cedula.trim() }),
				...(data.telefono && { telefono: data.telefono.trim() }),
			};

			if (residenteEditando) {
				// MODO EDICIÓN: El payload requiere el `numeroUnidad` y hacemos un PATCH.
				payload.numeroUnidad = data.unidad_id;
				await apiService.patch(`/admin/residentes/${residenteEditando.id}`, payload);
			} else {
				// // MODO CREACIÓN: El payload requiere `idUnidad` y hacemos un POST.
				// const unidadSeleccionada = unidadesDisponibles.find(
				// 	(u) => u.numero_unidad === data.unidad_id
				// );
				// if (!unidadSeleccionada) {
				// 	// Esta validación es una salvaguarda, aunque es improbable que ocurra.
				// 	throw new Error('La unidad seleccionada no es válida o ya no está disponible.');
				// }
				// payload.idUnidad = unidadSeleccionada.id;
				// await apiService.post('/admin/invitaciones/residentes', payload);
				const allUnits = [...unidadesDisponibles];
				if (
					residenteEditando &&
					!allUnits.some((u) => u.numero_unidad === residenteEditando.numero_unidad)
				) {
					allUnits.push({
						id: residenteEditando.id_unidad,
						numero_unidad: residenteEditando.numero_unidad,
					});
				}
				const unidadSeleccionada = allUnits.find((u) => u.numero_unidad === data.unidad_id);
				if (!unidadSeleccionada) throw new Error('La unidad seleccionada no es válida.');

				payload.idUnidad = unidadSeleccionada.id;
				await apiService.post('/admin/invitaciones/residentes', payload);
			}

			// Si la llamada a la API fue exitosa, notificamos al componente padre.
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error('Error al procesar residente:', error);
			// Proporcionamos feedback específico al usuario según el tipo de error.
			if (error.response?.status === 409) {
				toast.error('Ya existe un residente con este email o cédula.');
			} else {
				// toast.error(
				// 	error.message || `Error al ${residenteEditando ? 'actualizar' : 'invitar'}.`
				// );
				console.error('Error al procesar residente:', error);
				toast.error(
					error.response?.data?.message ||
						`Error al ${residenteEditando ? 'actualizar' : 'invitar'}.`
				);
			}
		}
	};

	/**
	 * @description Delega la acción de guardar un borrador al hook padre.
	 * Este hook ya no sabe "cómo" se guarda un borrador, solo notifica que "debe" guardarse.
	 */
	const handleGuardarBorrador = () => {
		// Obtenemos todos los valores actuales del formulario.
		const currentValues = watch();
		// Llamamos a la función que nos pasaron como prop, enviándole los datos.
		if (onGuardarBorrador) {
			onGuardarBorrador(currentValues);
		}
	};

	// Handlers para formatear la entrada del usuario en tiempo real.
	// const handleNombreChange = (e) =>
	// 	setValue(
	// 		'nombre',
	// 		utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')),
	// 		{ shouldValidate: true } // Dispara la validación tras el cambio.
	// 	);
	// const handleApellidoChange = (e) =>
	// 	setValue(
	// 		'apellido',
	// 		utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')),
	// 		{ shouldValidate: true } // Dispara la validación tras el cambio.
	// 	);
	// const handleCedulaChange = (e) =>
	// 	setValue('cedula', utils.formatearCedula(e.target.value), { shouldValidate: true }); // Dispara la validación tras el cambio.
	// const handleTelefonoChange = (e) =>
	// 	setValue('telefono', utils.formatearTelefono(e.target.value), { shouldValidate: true }); // Dispara la validación tras el cambio.

	// Handlers para formatear la entrada y marcar el formulario como "sucio" (`shouldDirty: true`). En cuanto el usuario teclee algo, incluso en un campo que estaba vacío por defecto. Esto asegura que `isDirty` se active incluso si el usuario solo llena campos opcionales.
	const handleNombreChange = (e) =>
		setValue(
			'nombre',
			utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')),
			{ shouldValidate: true, shouldDirty: true }
		);
	const handleApellidoChange = (e) =>
		setValue(
			'apellido',
			utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')),
			{ shouldValidate: true, shouldDirty: true }
		);
	const handleCedulaChange = (e) =>
		setValue('cedula', utils.formatearCedula(e.target.value), {
			shouldValidate: true,
			shouldDirty: true,
		});
	const handleTelefonoChange = (e) =>
		setValue('telefono', utils.formatearTelefono(e.target.value), {
			shouldValidate: true,
			shouldDirty: true,
		});

	/**
	 * @description Compara los valores actuales del formulario con los datos originales cargados.
	 * Esta función es la solución robusta al bug de `isDirty`, ya que no depende de la
	 * lógica interna de react-hook-form y detecta cualquier cambio, sea en campos
	 * requeridos u opcionales.
	 * @returns {boolean} `true` si ha habido al menos un cambio en el formulario.
	 */
	const hayCambios = useCallback(() => {
		// Si no hay datos originales con los que comparar, cualquier cosa es un cambio.
		if (!originalData) return isDirty;

		const currentValues = watch();

		// Comparamos campo por campo. Esto es más explícito y seguro que JSON.stringify.
		return (
			originalData.nombre !== currentValues.nombre ||
			originalData.apellido !== currentValues.apellido ||
			originalData.email !== currentValues.email ||
			originalData.cedula !== currentValues.cedula ||
			originalData.telefono !== currentValues.telefono ||
			originalData.unidad_id !== currentValues.unidad_id
		);
	}, [originalData, watch, isDirty]);

	// =================================================================
	// API PÚBLICA DEL HOOK
	// Devolvemos solo lo estrictamente necesario para que el componente del formulario renderice y funcione.
	// =================================================================
	return {
		register,
		onSubmit: handleSubmit(onSubmitLogic),
		errors,
		isSubmitting,
		//isDirty, // `isDirty` nos dice si el usuario ha modificado algún campo.
		handleNombreChange,
		handleApellidoChange,
		handleCedulaChange,
		handleTelefonoChange,
		handleGuardarBorrador,
		/**
		 * @description Determina si el botón "Guardar Borrador" debe estar habilitado.
		 * La condición es simple y se alinea con el requisito de producto:
		 * se puede guardar un borrador si el formulario ha sido modificado de alguna manera (`isDirty`).
		 * Forzamos `shouldDirty: true` en los handlers de cambio para asegurar que funcione.
		 */
		puedeGuardarBorrador: hayCambios(),
	};
};
