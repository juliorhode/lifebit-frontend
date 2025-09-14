import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import apiService from '../../../services/apiService';
import { useAuthStore } from '../../../store/authStore';

// VALIDACIONES: Schema de Yup para el formulario
const residenteSchema = yup.object().shape({
    nombre: yup
        .string()
        .required('El nombre es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    apellido: yup
        .string()
        .required('El apellido es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
        .min(3, 'El apellido debe tener al menos 3 caracteres')
        .max(100, 'El apellido no puede exceder 100 caracteres'),
    email: yup
        .string()
        .required('El email es obligatorio')
        .email('Ingresa un email válido')
        .max(255, 'El email es demasiado largo'),
    cedula: yup
        .string()
        .notRequired() // Explicitamente opcional
        .test('cedula-format', 'Formato inválido. Use: V12345678, E12345678 o J12345678', (value) => {
            if (!value || value.trim() === '') return true; // Completamente opcional
            return /^[VEJve]\d{7,8}$/.test(value);
        })
        .test('cedula-length', 'La cédula debe tener 8 o 9 caracteres (letra + 7-8 números)', (value) => {
            if (!value || value.trim() === '') return true; // Completamente opcional
            return value.length === 8 || value.length === 9;
        }),
    telefono: yup
        .string()
        .notRequired() // Explicitamente opcional
        .test('telefono-format', 'Formato inválido. Use: 02124763979, +584142075076, etc.', (value) => {
            if (!value || value.trim() === '') return true; // Completamente opcional
            // Permitir formatos venezolanos: 0XXXXXXXXXX o +58XXXXXXXXXX
            const telefonoRegex = /^(\+58|0)\d{10}$/;
            return telefonoRegex.test(value.replace(/\s+/g, ''));
        }),
    unidad_id: yup
        .string()
        .required('Debes seleccionar una unidad')
        .min(1, 'Selecciona una unidad válida')
});

/**
 * @description Modal para invitar a un nuevo residente individual
 * Incluye validaciones, auto-guardado de borradores y envío de invitación
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando la invitación es exitosa
 * @param {Object} props.initialData - Datos iniciales para precargar el formulario (opcional)
 * @returns {JSX.Element} Modal de invitación de residente
 */
const InvitarResidenteModal = ({ onClose, onSuccess, initialData = null, residenteEditando = null }) => {
    // STATE: Gestión del estado del componente
    const [unidades, setUnidades] = useState([]);
    const [isLoadingUnidades, setIsLoadingUnidades] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [borradorKey] = useState(initialData ? `borrador_residente_${initialData.timestamp || Date.now()}` : `borrador_residente_${Date.now()}`);

    // FORM: Configuración de React Hook Form con Yup
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isDirty },
        reset
    } = useForm({
        resolver: yupResolver(residenteSchema),
        defaultValues: initialData || {}, // Precargar datos si existen
        mode: 'onChange' // Validación en tiempo real
    });

    // CAPITALIZACIÓN: Función para capitalizar texto
    const capitalizarTexto = (texto) => {
        return texto.replace(/\b\w/g, letra => letra.toUpperCase());
    };

    // FORMATEO: Función para formatear cédula venezolana
    const formatearCedula = (valor) => {
        // Convertir a mayúscula y remover caracteres no válidos
        const limpio = valor.toUpperCase().replace(/[^VEJ0-9]/g, '');
        // Si ya tiene la letra al inicio, mantenerla
        if (limpio.match(/^[VEJ]/)) {
            return limpio.substring(0, 9); // Máximo 9 caracteres (V/E/J + 8 números)
        }
        // Si no tiene letra, agregar V por defecto para números
        if (limpio.match(/^\d/)) {
            return 'V' + limpio.substring(0, 8);
        }
        return limpio.substring(0, 9);
    };

    // FORMATEO: Función para formatear teléfono venezolano
    const formatearTelefono = (valor) => {
        // Remover todos los caracteres no numéricos excepto +
        const limpio = valor.replace(/[^\d+]/g, '');
        // Si comienza con +, mantener como internacional
        if (limpio.startsWith('+')) {
            return limpio.substring(0, 13); // +58 + 10 dígitos
        }
        // Si comienza con 0, es formato local venezolano
        if (limpio.startsWith('0')) {
            return limpio.substring(0, 11); // 0 + 10 dígitos
        }
        // Si son solo números, asumir formato local
        if (limpio.match(/^\d+$/)) {
            return limpio.startsWith('0') ? limpio.substring(0, 11) : ('0' + limpio).substring(0, 11);
        }
        return limpio.substring(0, 13);
    };

    // HANDLERS: Validación y formateo en tiempo real
    const handleNombreChange = (e) => {
        const valor = e.target.value;
        // Solo permitir letras, espacios y caracteres especiales latinos
        const filtrado = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setValue('nombre', capitalizarTexto(filtrado));
        trigger('nombre'); // Validar en tiempo real
    };

    const handleApellidoChange = (e) => {
        const valor = e.target.value;
        // Solo permitir letras, espacios y caracteres especiales latinos
        const filtrado = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setValue('apellido', capitalizarTexto(filtrado));
        trigger('apellido'); // Validar en tiempo real
    };

    const handleCedulaChange = (e) => {
        const valor = e.target.value;
        const formateado = formatearCedula(valor);
        setValue('cedula', formateado);
        if (formateado) trigger('cedula'); // Validar en tiempo real solo si hay valor
    };

    const handleTelefonoChange = (e) => {
        const valor = e.target.value;
        const formateado = formatearTelefono(valor);
        setValue('telefono', formateado);
        if (formateado) trigger('telefono'); // Validar en tiempo real solo si hay valor
    };

    // CARGA INICIAL: Obtener unidades disponibles según el contexto
    useEffect(() => {
        const cargarUnidades = async () => {
            try {
                setIsLoadingUnidades(true);

                // Cargar unidades y residentes simultáneamente
                const [unidadesResponse, residentesResponse] = await Promise.all([
                    apiService.get('/admin/unidades'),
                    apiService.get('/admin/residentes')
                ]);

                const unidadesData = unidadesResponse.data.data?.unidades || [];
                const residentesData = residentesResponse.data.data || [];

                // Filtrar unidades ocupadas por residentes activos (excluyendo al residente que se está editando)
                const unidadesOcupadas = new Set(
                    residentesData
                        .filter(residente => residente.estado === 'activo' && residente.id !== residenteEditando?.id)
                        .map(residente => residente.numero_unidad)
                );

                // Mostrar unidades disponibles + la unidad actual del residente en edición (si existe)
                let unidadesFiltradas = unidadesData.filter(
                    unidad => !unidadesOcupadas.has(unidad.numero_unidad)
                );

                // Si estamos editando, incluir la unidad actual del residente (aunque esté "ocupada" por él)
                if (residenteEditando && residenteEditando.numero_unidad) {
                    const unidadActual = unidadesData.find(
                        unidad => unidad.numero_unidad === residenteEditando.numero_unidad
                    );
                    if (unidadActual && !unidadesFiltradas.find(u => u.id === unidadActual.id)) {
                        unidadesFiltradas.push(unidadActual);
                    }
                }

                setUnidades(unidadesFiltradas);
            } catch (error) {
                console.error('Error al cargar unidades:', error);
                toast.error('Error al cargar las unidades');
                setUnidades([]); // Asegurar que sea array vacío en caso de error
            } finally {
                setIsLoadingUnidades(false);
            }
        };

        cargarUnidades();
    }, [residenteEditando]);

    // PRESELECCIÓN: Asegurar que la unidad se preseleccione cuando se carguen las unidades
    useEffect(() => {
        if (unidades.length > 0 && initialData?.unidad_id) {
            setValue('unidad_id', initialData.unidad_id);
        }
    }, [unidades, initialData?.unidad_id, setValue]);

    // BORRADORES: Auto-guardado cada 30 segundos si hay cambios (solo si no vino de initialData)
    const watchedValues = watch();
    useEffect(() => {
        // No auto-guardar si vino de initialData (borrador ya cargado)
        if (initialData) return;

        const interval = setInterval(() => {
            if (isDirty && Object.values(watchedValues).some(value => value)) {
                const borrador = {
                    ...watchedValues,
                    timestamp: Date.now()
                };
                localStorage.setItem(borradorKey, JSON.stringify(borrador));
            }
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [watchedValues, isDirty, borradorKey, initialData]);

    // CARGA INICIAL: Intentar cargar borrador existente (solo si no vino de initialData)
    useEffect(() => {
        // No cargar borrador si ya vino con initialData
        if (initialData) return;

        const borradorGuardado = localStorage.getItem(borradorKey);
        if (borradorGuardado) {
            try {
                const borrador = JSON.parse(borradorGuardado);
                // Verificar que no haya expirado (7 días)
                if (borrador.timestamp && (Date.now() - borrador.timestamp) < 7 * 24 * 60 * 60 * 1000) {
                    reset(borrador);
                    toast.info('Se cargó un borrador guardado anteriormente');
                } else {
                    localStorage.removeItem(borradorKey);
                }
            } catch (error) {
                localStorage.removeItem(borradorKey);
            }
        }
    }, [borradorKey, reset, initialData]);

    /**
     * @description Maneja el envío del formulario de invitación o edición
     * @param {Object} data - Datos validados del formulario
     */
    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const payload = {
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email
            };

            // Agregar campos opcionales solo si tienen valores
            if (data.cedula && data.cedula.trim()) {
                payload.cedula = data.cedula.trim();
            }
            if (data.telefono && data.telefono.trim()) {
                payload.telefono = data.telefono.trim();
            }

            if (residenteEditando) {
                // EDITAR: Usar PATCH al endpoint específico del residente
                payload.numeroUnidad = data.unidad_id; // Para edición usa 'numeroUnidad' (string)
                await apiService.patch(`/admin/residentes/${residenteEditando.id}`, payload);
            } else {
                // CREAR: Convertir numero_unidad al ID para el backend
                const unidadSeleccionada = unidades.find(u => u.numero_unidad === data.unidad_id);
                if (!unidadSeleccionada) {
                    throw new Error('Unidad seleccionada no encontrada');
                }

                payload.idUnidad = unidadSeleccionada.id; // Para creación usa 'idUnidad' (integer)
                await apiService.post('/admin/invitaciones/residentes', payload);
            }

            // LIMPIEZA: Eliminar borrador después de éxito (siempre, independientemente del origen)
            localStorage.removeItem(borradorKey);

            // CALLBACK: Notificar éxito al componente padre
            onSuccess();

        } catch (error) {
            console.error('Error al procesar residente:', error);

            // MANEJO DE ERRORES: Mensajes específicos según el tipo de error
            if (error.response?.status === 409) {
                toast.error('Ya existe un residente con este email');
            } else if (error.response?.status === 400) {
                toast.error('Datos inválidos. Revisa el formulario');
            } else {
                const accion = residenteEditando ? 'actualizar' : 'enviar la invitación';
                toast.error(`Error al ${accion}. Inténtalo de nuevo`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * @description Maneja el guardado manual de borrador
     */
    const handleGuardarBorrador = () => {
        const borrador = {
            ...watchedValues,
            timestamp: Date.now()
        };
        localStorage.setItem(borradorKey, JSON.stringify(borrador));
        toast.success('Borrador guardado exitosamente');
    };

    /**
     * @description Maneja el cierre del modal con confirmación si hay cambios
     */
    const handleClose = () => {
        if (isDirty && !confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
            return;
        }
        // Limpiar borrador al cerrar sin guardar (solo si no vino de un borrador)
        if (!initialData) {
            localStorage.removeItem(borradorKey);
        }
        onClose();
    };

    return (
        <div className="space-y-6">
            {/* HEADER: Título y descripción */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Invitar Nuevo Residente
                </h3>
                <p className="text-gray-400 text-sm">
                    Completa los datos para enviar una invitación por email.
                    El residente podrá acceder a la plataforma una vez que acepte.
                </p>
            </div>

            {/* FORM: Formulario de invitación */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* NOMBRE Y APELLIDO */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            {...register('nombre')}
                            onChange={handleNombreChange}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.nombre ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="Juan"
                            disabled={isSubmitting}
                            autoComplete="given-name"
                        />
                        {errors.nombre && (
                            <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            {...register('apellido')}
                            onChange={handleApellidoChange}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.apellido ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="Pérez"
                            disabled={isSubmitting}
                            autoComplete="family-name"
                        />
                        {errors.apellido && (
                            <p className="text-red-400 text-sm mt-1">{errors.apellido.message}</p>
                        )}
                    </div>
                </div>

                {/* EMAIL */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        {...register('email')}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="juan.perez@email.com"
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* CÉDULA Y TELÉFONO */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Cédula
                        </label>
                        <input
                            type="text"
                            {...register('cedula')}
                            onChange={handleCedulaChange}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.cedula ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="V12345678"
                            disabled={isSubmitting}
                            maxLength="9"
                        />
                        {errors.cedula && (
                            <p className="text-red-400 text-sm mt-1">{errors.cedula.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            {...register('telefono')}
                            onChange={handleTelefonoChange}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.telefono ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="04141234567"
                            disabled={isSubmitting}
                            maxLength="13"
                        />
                        {errors.telefono && (
                            <p className="text-red-400 text-sm mt-1">{errors.telefono.message}</p>
                        )}
                    </div>
                </div>

                {/* UNIDAD */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Unidad *
                    </label>
                    <select
                        {...register('unidad_id')}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.unidad_id ? 'border-red-500' : 'border-gray-600'
                        }`}
                        disabled={isSubmitting || isLoadingUnidades}
                    >
                        <option value="">
                            {isLoadingUnidades
                                ? 'Cargando unidades...'
                                : unidades.length === 0
                                    ? residenteEditando
                                        ? 'No hay unidades disponibles'
                                        : 'No hay unidades disponibles (todas ocupadas)'
                                    : residenteEditando
                                        ? 'Selecciona una unidad'
                                        : 'Selecciona una unidad disponible'
                            }
                        </option>
                        {unidades?.map((unidad) => (
                            <option key={unidad.id} value={unidad.numero_unidad}>
                                {unidad.numero_unidad}
                            </option>
                        ))}
                    </select>
                    {errors.unidad_id && (
                        <p className="text-red-400 text-sm mt-1">{errors.unidad_id.message}</p>
                    )}
                </div>


                {/* ACCIONES: Botones del formulario */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleGuardarBorrador}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                        <i className="fas fa-save mr-2"></i>
                        Guardar Borrador
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane mr-2"></i>
                                {residenteEditando ? 'Actualizar Residente' : 'Enviar Invitación'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* INFO: Auto-guardado */}
            <div className="text-xs text-gray-500 text-center">
                <i className="fas fa-info-circle mr-1"></i>
                Los borradores se guardan automáticamente cada 30 segundos
            </div>

            {/* ADVERTENCIA: Sin unidades disponibles */}
            {!isLoadingUnidades && unidades.length === 0 && (
                <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-3 text-center">
                    <i className="fas fa-exclamation-triangle text-yellow-400 mb-2 text-lg"></i>
                    <p className="text-yellow-200 text-sm">
                        {residenteEditando
                            ? "No hay unidades disponibles para cambiar."
                            : "No hay unidades disponibles. Todas las unidades están ocupadas por residentes activos."
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvitarResidenteModal;