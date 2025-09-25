// 1. Importamos React y nuestro nuevo hook inteligente. Las demás importaciones se han ido.
import React from 'react';
import { useResidenteForm } from '../hooks/useResidenteForm';

/**
 * @description Modal para invitar a un nuevo residente individual
 * Incluye validaciones, auto-guardado de borradores y envío de invitación
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando la invitación es exitosa
 * @param {Object} props.initialData - Datos iniciales para precargar el formulario (opcional)
 * @returns {JSX.Element} Modal de invitación de residente
 */
const InvitarResidenteModal = ({ onClose, onSuccess, onBorradorGuardado = null, initialData = null, residenteEditando = null }) => {

    // 2. Llamamos a nuestro hook inteligente y le pasamos las props que necesita.
    // Desestructuramos el objeto que nos devuelve para obtener todas las herramientas.
    const {
        register,
        onSubmit,
        errors,
        isSubmitting,
        unidades,
        isLoadingUnidades,
        handleNombreChange,
        handleApellidoChange,
        handleCedulaChange,
        handleTelefonoChange,
        handleGuardarBorrador,
        isDirty,
        puedeGuardarBorrador, // ✅ NUEVO: Nueva lógica para guardar borradores
    } = useResidenteForm({
        onSuccess,
        onBorradorGuardado, // ✅ NUEVO: Para refrescar panel de borradores
        residenteEditando,
        initialData
    });

    // Lógica de cierre que depende del estado `isDirty` del hook.
    const handleClose = () => {
        if (isDirty && !confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
            return;
        }

        // NOTA: La lógica de limpieza de borradores se manejará en el componente padre (`ResidentesPage`).
        // El modal solo notifica que debe cerrarse.
        onClose();
    };

    // 3. El componente ahora es "tonto". Solo se encarga de renderizar el JSX.
    // Toda la lógica compleja vive dentro de `useResidenteForm`.
    return (
        <div className="space-y-6">
            {/* Botón de cierre que utiliza el handler con lógica de confirmación */}
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white z-10">
                <i className="fas fa-times text-xl"></i>
            </button>

            {/* HEADER: Título y descripción */}
            <div>
                {/* Título dinámico según el contexto */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {residenteEditando ? 'Editar Residente' : 'Invitar Nuevo Residente'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Completa los datos para enviar una invitación por email.
                    El residente podrá acceder a la plataforma una vez que acepte.
                </p>
            </div>

            {/* FORM: Formulario de invitación */}
            {/* El `onSubmit` del formulario ahora viene directamente del hook */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* NOMBRE Y APELLIDO */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            {...register('nombre')}
                            onChange={handleNombreChange}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.nombre ? 'border-red-500' : ''
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            {...register('apellido')}
                            onChange={handleApellidoChange}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.apellido ? 'border-red-500' : ''
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        {...register('email')}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : ''
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cédula
                        </label>
                        <input
                            type="text"
                            {...register('cedula')}
                            onChange={handleCedulaChange}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.cedula ? 'border-red-500' : ''
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            {...register('telefono')}
                            onChange={handleTelefonoChange}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.telefono ? 'border-red-500' : ''
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unidad *
                    </label>
                    <select
                        {...register('unidad_id')}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.unidad_id ? 'border-red-500' : ''
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
                        onClick={() => {
                            handleGuardarBorrador();
                        }}
                        disabled={isSubmitting || !puedeGuardarBorrador}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-save mr-2"></i>
                        Guardar Borrador
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                        onClick={() => {
                            // Lógica de envío se maneja en onSubmit
                        }}
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

            {/* El texto de auto-guardado se elimina, ya que la funcionalidad ahora es manual */}

            {/* ADVERTENCIA: Sin unidades disponibles */}
            {!isLoadingUnidades && unidades.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-50 border border-yellow-200 dark:border-yellow-600 rounded-lg p-3 text-center">
                    <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mb-2 text-lg"></i>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
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