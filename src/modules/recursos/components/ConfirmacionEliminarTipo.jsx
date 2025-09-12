import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/ui/Spinner';

/**
 * @description Contenido del modal para la confirmación de eliminación de un Tipo de Recurso.
 * Implementa un mecanismo de "confirmación fuerte" para prevenir acciones accidentales.
 * @param {object} props
 * @param {object} props.tipo - El objeto del tipo de recurso a eliminar.
 * @param {function} props.onSuccess - Callback para notificar al padre que la eliminación fue exitosa.
 * @param {function} props.onCancel - Callback para cerrar el modal.
 */
const ConfirmacionEliminarTipo = ({ tipo, onSuccess, onCancel }) => {
    // AQUI VA EL CAMBIO: ESTADO PARA CONTROLAR EL INPUT DE CONFIRMACIÓN
    const [confirmationText, setConfirmationText] = useState('');

    // AQUI VA EL CAMBIO: ESTADO PARA LA LLAMADA A LA API Y EL FEEDBACK
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AQUI VA EL CAMBIO: ESTADO PARA ALMACENAR EL CONTEO DE RECURSOS ASOCIADOS
    const [itemCount, setItemCount] = useState(null);
    const [isLoadingCount, setIsLoadingCount] = useState(true);

    // AQUI VA EL CAMBIO: EFECTO PARA OBTENER EL NÚMERO DE ITEMS ASOCIADOS
    // Esto provee al usuario el contexto crucial de las consecuencias de su acción.
    useEffect(() => {
        const fetchItemCount = async () => {
            if (!tipo) return;
            setIsLoadingCount(true);
            try {
                // Asumimos que la API nos dará un endpoint para contar recursos por tipo.
                // Esto es más eficiente que traer todos los recursos.
                const response = await apiService.get(`/admin/recursos/por-tipo/${tipo.id}`);
                setItemCount(response.data.count);
            } catch (error) {
                // Si falla el conteo, no bloqueamos la eliminación, pero lo registramos.
                console.error("Error al contar los recursos asociados:", error);
                setItemCount(0); // Asumimos 0 para no bloquear al usuario.
            } finally {
                setIsLoadingCount(false);
            }
        };

        fetchItemCount();
    }, [tipo]); // Se ejecuta cada vez que el `tipo` a eliminar cambia.


    /**
     * @description Maneja el envío del formulario de eliminación.
     */
    const handleEliminar = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading('Eliminando tipo de recurso...');
        try {
            await apiService.delete(`/admin/recursos/tipos/${tipo.id}`);
            toast.success('Tipo de recurso eliminado con éxito.', { id: toastId });
            onSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.error?.mensaje || 'Error al eliminar.';
            toast.error(errorMessage, { id: toastId });
            setIsSubmitting(false);
        }
    };

    // El botón de confirmación se habilita solo si el texto introducido
    // coincide exactamente con el nombre del tipo de recurso.
    const isConfirmationValid = confirmationText === tipo.nombre;

    return (
        <div className="space-y-4">
            <p className="text-lg text-gray-300 text-center">
                ¿Estás seguro de que deseas eliminar el tipo de recurso?
            </p>

            {/* AQUI VA EL CAMBIO: FEEDBACK VISUAL DEL ITEM A ELIMINAR */}
            <div className="bg-gray-800 p-4 rounded-lg text-center">
                <span className="font-bold text-xl text-red-400">{tipo.nombre}</span>
            </div>

            {/* AQUI VA EL CAMBIO: ADVERTENCIA DE CONSECUENCIAS */}
            <div className={`${STYLES.errorText} text-center`}>
                <h4 className="font-bold">¡Atención! Esta acción es irreversible.</h4>
                {isLoadingCount ? (
                    <p>Calculando impacto...</p>
                ) : (
                    <p>
                        Se eliminarán permanentemente los <strong>{itemCount}</strong> items de inventario asociados a este tipo.
                    </p>
                )}
            </div>

            {/* AQUI VA EL CAMBIO: INPUT DE CONFIRMACIÓN FUERTE */}
            <div>
                <label htmlFor="confirmation" className={STYLES.label}>
                    Para confirmar, por favor escribe "<strong className="text-red-300">{tipo.nombre}</strong>" en el campo de abajo:
                </label>
                <input
                    id="confirmation"
                    type="text"
                    className={STYLES.input}
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    autoComplete="off"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className={STYLES.buttonSecondary}
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleEliminar}
                    // AQUI VA EL CAMBIO: LÓGICA DE DESHABILITACIÓN
                    // El botón solo se activa si la confirmación es válida y no se está procesando.
                    disabled={!isConfirmationValid || isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors disabled:bg-red-800/50 disabled:cursor-not-allowed flex justify-center items-center h-[52px]"
                >
                    {isSubmitting ? <Spinner type="dots" /> : 'Eliminar Definitivamente'}
                </button>
            </div>
        </div>
    );
};

export default ConfirmacionEliminarTipo;