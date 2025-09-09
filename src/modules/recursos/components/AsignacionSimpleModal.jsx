import React, { useState } from 'react';
import { STYLES } from '../../../utils/styleConstants.jsx';

/**
 * @description Componente que renderiza el contenido del modal para la asignación o desasignación de un único recurso (modo 'simple').
 * Muestra una interfaz diferente dependiendo de si el recurso ya está asignado o no.
 * 
 * @param {object} props
 * @param {object} props.item - El objeto del recurso que se está gestionando. Debe contener `id`, `identificador_unico` y `propietario_nombre`.
 * @param {Array<object>} props.unidades - La lista de todas las unidades disponibles para poblar el menú desplegable.
 * @param {function} props.onAsignar - Callback del hook principal para ejecutar la lógica de asignación.
 * @param {function} props.onDesasignar - Callback del hook principal para ejecutar la lógica de desasignación.
 * @param {function} props.onClose - Función para cerrar el modal una vez completada la acción.
 */
const AsignacionSimpleModal = ({ item, unidades, onAsignar, onDesasignar, onClose }) => {
    /** @type {[string, function]} unidadId - Estado local para almacenar el ID de la unidad seleccionada en el menú desplegable. */
    const [unidadId, setUnidadId] = useState('');

    /**
     * @description Maneja el clic en el botón de confirmar asignación. Encuentra la unidad completa y llama al callback `onAsignar`.
     */
    const handleAsignarClick = () => {
        if (!unidadId) return; // No hacer nada si no se ha seleccionado una unidad.
        const unidad = unidades.find(u => u.id === parseInt(unidadId));
        if (unidad) {
            // Llama a la función del hook principal para actualizar el estado.
            onAsignar([item.id], unidad);
            onClose(); // Cierra el modal después de la acción.
        }
    };

    /**
     * @description Maneja el clic en el botón de confirmar desasignación. Llama al callback `onDesasignar`.
     */
    const handleDesasignarClick = () => {
        onDesasignar([item.id]);
        onClose(); // Cierra el modal después de la acción.
    };

    return (
        <div>
            <p className="text-center text-gray-400 mb-4">
                Estás gestionando el recurso: <strong className="text-white font-mono">{item.identificador_unico}</strong>
            </p>

            {/* 
              Renderizado condicional basado en la existencia de `propietario_nombre`.
              - Si el item tiene un propietario, se muestra la interfaz de desasignación.
              - Si está libre, se muestra el formulario para asignarlo a una nueva unidad.
            */}
            {item.propietario_nombre ? (
                // --- VISTA DE DESASIGNACIÓN: Se muestra si el recurso ya está ocupado ---
                <div>
                    <p className="text-center text-lg text-white">
                        Asignado a: <span className="font-bold text-blue-400">{item.propietario_nombre}</span>
                    </p>
                    <p className="text-center text-gray-400 mt-4">¿Deseas desasignar este recurso?</p>
                    <button onClick={handleDesasignarClick} className={`${STYLES.buttonPrimary} w-full mt-4 bg-red-600 hover:bg-red-700`}>
                        Sí, Desasignar
                    </button>
                </div>
            ) : (
                // --- VISTA DE ASIGNACIÓN: Se muestra si el recurso está disponible ---
                <div className="space-y-3">
                    <label className={STYLES.label}>Asignar a la Unidad:</label>
                    <select value={unidadId} onChange={(e) => setUnidadId(e.target.value)} className={STYLES.input}>
                        <option value="" disabled>Selecciona una unidad...</option>
                        {unidades && unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad}</option>)}
                    </select>
                    <button onClick={handleAsignarClick} className={`${STYLES.buttonPrimary} w-full`} disabled={!unidadId}>
                        Confirmar Asignación
                    </button>
                </div>
            )}
        </div>
    );
};

export default AsignacionSimpleModal;
