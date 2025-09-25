import React, { useState } from 'react';
import { STYLES } from '../../../utils/styleConstants.jsx';

/**
 * @description Barra de herramientas contextual que aparece en la parte inferior
 * de la pantalla durante el modo de asignación masiva.
 * 
 * @param {object} props
 * @param {number} props.selectedCount - El número de items actualmente seleccionados.
 * @param {Array<object>} props.unidades - La lista de unidades disponibles para asignar.
 * @param {function} props.onAsignar - Callback a ejecutar al confirmar la asignación.
 * @param {function} props.onDesasignar - Callback para desasignar la selección.
 * @param {function} props.onCancel - Callback para cancelar el modo de selección.
 */
const AsignacionToolbar = ({ selectedCount, unidades, onAsignar, onDesasignar, onCancel, seleccionContieneOcupados }) => {
    // Estado local para el valor del <select>
    const [unidadSeleccionadaId, setUnidadSeleccionadaId] = useState('');

    const handleConfirmarAsignacion = () => {
        if (!unidadSeleccionadaId) {
            alert('Por favor, selecciona una unidad.');
            return;
        }
        onAsignar(parseInt(unidadSeleccionadaId, 10));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 border-t-2 border-b-2 border-blue-800 p-4 flex flex-col md:flex-row items-center gap-4">

            {/* --- SECCIÓN IZQUIERDA: INFORMACIÓN (Sin cambios) --- */}
            <div className="text-gray-700 dark:text-white text-center md:text-left flex-shrink-0">
                <span className="font-bold text-lg">{selectedCount}</span>
                <span className="ml-2">recurso(s) seleccionado(s)</span>
            </div>

            {/* --- SECCIÓN CENTRAL: ASIGNACIÓN (La que crece) --- */}
            {/* `flex-grow` le dice a este div que ocupe todo el espacio sobrante en el medio */}
            <div className="w-full md:w-auto flex-grow flex items-center gap-2">
                <select
                    value={unidadSeleccionadaId}
                    onChange={(e) => setUnidadSeleccionadaId(e.target.value)}
                    className={`${STYLES.input} w-full`} // w-full para que llene su contenedor
                    disabled={seleccionContieneOcupados }
                >
                    <option value="" disabled>Asignar a...</option>
                    {unidades.map(unidad => (
                        <option key={unidad.id} value={unidad.id}>{unidad.numero_unidad}</option>
                    ))}
                </select>
                <button
                    onClick={handleConfirmarAsignacion}
                    disabled={!unidadSeleccionadaId}
                    className={STYLES.buttonPrimaryAuto}
                >
                    Asignar
                </button>
            </div>

            {/* --- SECCIÓN DERECHA: OTRAS ACCIONES (Ancho fijo) --- */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onDesasignar} className={STYLES.buttonCancel}>
                    Desasignar
                </button>
                
            </div>
        </div>
    );
};

export default AsignacionToolbar;
