/**
 * @description Componente Modal para invitar o editar un residente.
 * Este es un "componente presentacional" o "tonto". Su única responsabilidad es
 * renderizar la interfaz del formulario. No contiene lógica de negocio compleja,
 * sino que la delega completamente al hook `useResidenteForm`.
 *
 * @param {Object} props - Las propiedades que recibe del componente padre (`ResidentesPage`).
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onSuccess - Callback a ejecutar cuando el formulario se envía con éxito.
 * @param {Function} props.onGuardarBorrador - Callback para delegar la acción de guardar un borrador.
 * @param {Object|null} props.initialData - Datos de un borrador para precargar el formulario.
 * @param {Object|null} props.residenteEditando - Datos de un residente para el modo edición.
 * @param {Array} props.unidadesDisponibles - Lista de unidades disponibles para asignar.
 * @returns {JSX.Element} El modal con el formulario de invitación/edición.
 */
import React from 'react';
import { useResidenteForm } from '../hooks/useResidenteForm';

const InvitarResidenteModal = ({
    onClose,
    onSuccess,
    onGuardarBorrador,
    initialData = null,
    residenteEditando = null,
    unidadesDisponibles = []
}) => {

    // Instanciamos nuestro hook de formulario especializado.
    // Le pasamos todas las funciones y datos que necesita para operar.
    const {
        register,
        onSubmit,
        errors,
        isSubmitting,
        isDirty,
        handleNombreChange,
        handleApellidoChange,
        handleCedulaChange,
        handleTelefonoChange,
        handleGuardarBorrador,
        puedeGuardarBorrador,
    } = useResidenteForm({
        onSuccess,
        onGuardarBorrador,
        residenteEditando,
        initialData,
        unidadesDisponibles, // Le pasamos la lista de unidades ya filtrada.
    });

    // La lógica de cierre se mantiene simple: si el formulario ha sido modificado,
    // se pide confirmación al usuario para evitar pérdidas de datos accidentales.
    const handleClose = () => {
        if (isDirty && !window.confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
            return;
        }
        onClose();
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white z-10">
                <i className="fas fa-times text-xl"></i>
            </button>

            {/* HEADER: Título y descripción del modal */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {residenteEditando ? 'Editar Residente' : 'Invitar Nuevo Residente'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {residenteEditando
                        ? 'Actualiza los datos del residente. Los cambios se reflejarán inmediatamente.'
                        : 'Completa los datos para enviar una invitación por email. El residente podrá acceder una vez que acepte.'
                    }
                </p>
            </div>

            {/* FORMULARIO: El `onSubmit` es manejado por el hook `useResidenteForm` */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* FILA 1: NOMBRE Y APELLIDO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-theme">Nombre *</label>
                        <input
                            type="text"
                            {...register('nombre')}
                            onChange={handleNombreChange}
                            className={`input-theme ${errors.nombre ? 'border-red-500' : ''}`}
                            placeholder="Ej: Juan"
                            disabled={isSubmitting}
                            autoComplete="given-name"
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label-theme">Apellido *</label>
                        <input
                            type="text"
                            {...register('apellido')}
                            onChange={handleApellidoChange}
                            className={`input-theme ${errors.apellido ? 'border-red-500' : ''}`}
                            placeholder="Ej: Pérez"
                            disabled={isSubmitting}
                            autoComplete="family-name"
                        />
                        {errors.apellido && (
                            <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                        )}
                    </div>
                </div>

                {/* FILA 2: EMAIL */}
                <div>
                    <label className="label-theme">Correo Electrónico *</label>
                    <input
                        type="email"
                        {...register('email')}
                        className={`input-theme ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="juan.perez@email.com"
                        disabled={isSubmitting || !!residenteEditando} // El email no se puede editar.
                        autoComplete="email"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                    {residenteEditando && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El correo electrónico no puede ser modificado.</p>
                    )}
                </div>

                {/* FILA 3: CÉDULA Y TELÉFONO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-theme">Cédula (Opcional)</label>
                        <input
                            type="text"
                            {...register('cedula')}
                            onChange={handleCedulaChange}
                            className={`input-theme ${errors.cedula ? 'border-red-500' : ''}`}
                            placeholder="V12345678"
                            disabled={isSubmitting}
                            maxLength="10"
                        />
                        {errors.cedula && (
                            <p className="text-red-500 text-sm mt-1">{errors.cedula.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label-theme">Teléfono (Opcional)</label>
                        <input
                            type="tel"
                            {...register('telefono')}
                            onChange={handleTelefonoChange}
                            className={`input-theme ${errors.telefono ? 'border-red-500' : ''}`}
                            placeholder="04141234567"
                            disabled={isSubmitting}
                            maxLength="13"
                        />
                        {errors.telefono && (
                            <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
                        )}
                    </div>
                </div>

                {/* FILA 4: UNIDAD */}
                <div>
                    <label className="label-theme">Unidad *</label>
                    <select
                        {...register('unidad_id')}
                        className={`input-theme ${errors.unidad_id ? 'border-red-500' : ''}`}
                        disabled={isSubmitting}
                    >
                        <option value="">
                            {unidadesDisponibles.length === 0 && !residenteEditando
                                ? 'No hay unidades disponibles'
                                : 'Selecciona una unidad'
                            }
                        </option>
                        {unidadesDisponibles.map((unidad) => (
                            <option key={unidad.id} value={unidad.numero_unidad}>
                                {unidad.numero_unidad}
                            </option>
                        ))}
                        {/* 
                          Lógica para el modo edición: Si la unidad actual del residente
                          no está en la lista de disponibles (que es lo normal), la añadimos
                          explícitamente para que aparezca seleccionada y siga siendo una opción.
                        */}
                        {residenteEditando && !unidadesDisponibles.some(u => u.numero_unidad === residenteEditando.numero_unidad) && (
                            <option key={residenteEditando.id_unidad} value={residenteEditando.numero_unidad}>
                                {residenteEditando.numero_unidad} (Actual)
                            </option>
                        )}
                    </select>
                    {errors.unidad_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.unidad_id.message}</p>
                    )}
                </div>

                {/* ACCIONES: Botones del formulario */}
                <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleGuardarBorrador}
                        disabled={isSubmitting || !puedeGuardarBorrador}
                        className="w-full btn-secondary bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
                    >
                        <i className="fas fa-save mr-2"></i>
                        Guardar Borrador
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Procesando...
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
        </div>
    );
};

export default InvitarResidenteModal;