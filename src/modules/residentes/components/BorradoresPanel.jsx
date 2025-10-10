/**
 * @description Componente presentacional que muestra una lista de invitaciones guardadas como borradores.
 * Este componente ha sido refactorizado para ser "tonto", lo que significa que no contiene
 * lógica de estado ni de obtención de datos. Recibe la lista de borradores y las funciones
 * para interactuar con ellos directamente como props desde su componente padre.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Array} props.borradores - La lista de objetos de borradores a mostrar.
 * @param {Function} props.onCargarBorrador - Función a llamar cuando se hace clic en 'Continuar'.
 * @param {Function} props.onEliminarBorrador - Función a llamar cuando se hace clic en 'Eliminar'.
 * @returns {JSX.Element|null} El panel de borradores, o null si no hay borradores para mostrar.
 */
import React, { useState } from 'react';
import { FiTrash2, FiPlay, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const BorradoresPanel = ({ borradores = [], onCargarBorrador, onEliminarBorrador }) => {
    // Este estado local `isExpanded` es puramente para la UI (controlar el acordeón).
    // No maneja datos de la aplicación, por lo que es apropiado mantenerlo aquí.
    const [isExpanded, setIsExpanded] = useState(false);

    // Si el array de borradores que recibimos está vacío, no renderizamos nada.
    if (borradores.length === 0) {
        return null;
    }

    return (
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 border-l-4 border-blue-500 p-4 shadow-sm">
            {/* Cabecera del panel, que también funciona como un botón para expandir/contraer. */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center">
                    <i className="fas fa-sticky-note text-blue-500 dark:text-blue-400 mr-3 text-lg"></i>
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold">
                            {`Tienes ${borradores.length} borrador${borradores.length > 1 ? 'es' : ''} pendiente${borradores.length > 1 ? 's' : ''}`}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Invitaciones sin completar. ¡No las olvides!
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    {/* Icono que indica si el panel está expandido o contraído */}
                    {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </div>
            </div>

            {/* CONTENIDO EXPANDIBLE: Lista de borradores */}
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {borradores.map((borrador) => (
                        <div key={borrador.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between border border-gray-200 dark:border-gray-600">
                            {/* Información del borrador */}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-gray-900 dark:text-white font-medium truncate">
                                    {borrador.nombre || 'Borrador sin nombre'} {borrador.apellido || ''}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
                                    {borrador.email || 'Sin email'}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    Guardado el {new Date(borrador.timestamp).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Acciones para el borrador */}
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evita que el clic en el botón también contraiga el panel.
                                        onCargarBorrador(borrador);
                                    }}
                                    className="p-2 text-blue-500 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                                    title="Continuar con esta invitación"
                                >
                                    <FiPlay size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Notificamos al padre que este borrador debe ser eliminado, pasando su `key` única.
                                        onEliminarBorrador(borrador.key);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                    title="Eliminar borrador"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BorradoresPanel;