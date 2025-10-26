import React, { useState } from 'react'; // Importamos useState
import { STYLES } from '../../../utils/styleConstants';
import { toast } from 'react-hot-toast';

const InventarioToolbar = ({ selectedCount, pisos, onMoverUbicacion, onCambiarEstado }) => {
    
    // Se introduce `useState` para controlar el select, siguiendo el patrón de AsignacionToolbar.
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');

    const handleConfirmarMovimiento = () => {
        if (!ubicacionSeleccionada) {
            toast.warn('Por favor, selecciona una ubicación de destino.');
            return;
        }
        onMoverUbicacion(ubicacionSeleccionada);
        // Reseteamos el estado del select después de la acción.
        setUbicacionSeleccionada('');
    };

    return (
        <div className="bg-surface-secondary border-t-2 border-b-2 border-blue-800 p-4 w-full">
            <div className="flex flex-col gap-4">
                {/* --- FILA 1: MOVER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Indicador de Selección */}
                    <div className="text-secondary text-center sm:text-left flex-shrink-0 whitespace-nowrap">
                        <span className="font-bold text-lg text-primary">{selectedCount}</span>
                        <span className="ml-2">ítem(s) seleccionado(s)</span>
                    </div>

                    {/* Lógica de Mover Ubicación (sin <form>)  w-full md:w-auto flex-grow flex items-center gap-2*/}
                    <div className="flex-grow flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={ubicacionSeleccionada} // Controlado por el estado
                            onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                            className={`${STYLES.input} flex-grow`}
                        >
                            <option value="" disabled>Mover a...</option>
                            {pisos.map(piso => (
                                <option key={piso} value={piso}>{piso}</option>
                            ))}
                        </select>
                        <button
                            type="button" // Es un botón normal, no de submit
                            onClick={handleConfirmarMovimiento}
                            disabled={!ubicacionSeleccionada} // Deshabilitado si no hay selección
                            className={STYLES.buttonPrimaryAuto}
                        >
                            Mover
                        </button>
                    </div>
                </div>

                {/* --- FILA 2: MARCAR COMO --- */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-secondary mr-2 flex-shrink-0 mb-2 sm:mb-0 whitespace-nowrap">
                        Marcar como:
                    </span>
                    <div className="w-full grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => onCambiarEstado('operativo')} className="btn-secondary h-10 bg-green-500/10 text-green-400 hover:bg-green-500/20">
                            Operativo
                        </button>
                        <button type="button" onClick={() => onCambiarEstado('en_mantenimiento')} className="btn-secondary h-10 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">
                            Mantenimiento
                        </button>
                        <button type="button" onClick={() => onCambiarEstado('no_operativo')} className="btn-secondary h-10 bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            No Operativo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventarioToolbar;