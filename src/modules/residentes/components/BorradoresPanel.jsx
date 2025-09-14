import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlay } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/**
 * @description Panel que muestra invitaciones de residentes guardadas como borradores
 * Aplica el principio de Zeigarnik mostrando tareas pendientes para motivar completación
 * Los borradores se almacenan en localStorage con expiración automática
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCargarBorrador - Función para cargar un borrador en el modal
 * @returns {JSX.Element} Panel de borradores o null si no hay borradores
 */
const BorradoresPanel = ({ onCargarBorrador }) => {
    const [borradores, setBorradores] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // CARGA INICIAL: Obtener borradores desde localStorage
    useEffect(() => {
        cargarBorradores();
    }, []);

    /**
     * @description Carga borradores desde localStorage y filtra expirados
     */
    const cargarBorradores = () => {
        try {
            const borradoresGuardados = [];
            const ahora = Date.now();

            // Buscar todas las claves que empiecen con 'borrador_residente_'
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    try {
                        const borrador = JSON.parse(localStorage.getItem(key));

                        // Verificar si no ha expirado (7 días máximo)
                        if (borrador.timestamp && (ahora - borrador.timestamp) < 7 * 24 * 60 * 60 * 1000) {
                            borradoresGuardados.push({
                                id: key,
                                ...borrador
                            });
                        } else {
                            // Limpiar borradores expirados
                            localStorage.removeItem(key);
                        }
                    } catch (error) {
                        // Si hay error al parsear, limpiar el item corrupto
                        localStorage.removeItem(key);
                    }
                }
            }

            setBorradores(borradoresGuardados);
        } catch (error) {
            console.error('Error al cargar borradores:', error);
        }
    };

    /**
     * @description Elimina un borrador específico
     * @param {string} borradorId - ID del borrador a eliminar
     */
    const eliminarBorrador = (borradorId) => {
        localStorage.removeItem(borradorId);
        setBorradores(prev => prev.filter(b => b.id !== borradorId));
        toast.success('Borrador eliminado');
    };

    /**
     * @description Carga un borrador en el modal de invitación
     * @param {Object} borrador - Datos del borrador a cargar
     */
    const cargarBorrador = (borrador) => {
        if (onCargarBorrador) {
            // Extraer solo los campos del formulario (excluir timestamp e id)
            const { timestamp, id, ...datosFormulario } = borrador;
            onCargarBorrador(datosFormulario);
            toast.success('Borrador cargado en el formulario');
        }
    };

    // NO RENDERIZAR: Si no hay borradores, no mostrar el panel
    if (borradores.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-lg border-l-4 border-blue-500 p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center">
                    <i className="fas fa-sticky-note text-blue-400 mr-3 text-lg"></i>
                    <div>
                        <h3 className="text-white font-semibold">
                            Tienes {borradores.length} borrador{borradores.length !== 1 ? 'es' : ''} pendiente{borradores.length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-gray-300 text-sm">
                            {isExpanded ? 'Haz clic para contraer' : 'Invitaciones sin completar - ¡No las olvides!'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="bg-blue-600 text-blue-100 text-xs px-2 py-1 rounded-full mr-3">
                        {borradores.length}
                    </span>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-blue-400 transition-transform duration-200`}></i>
                </div>
            </div>

            {/* CONTENIDO EXPANDIBLE: Lista de borradores */}
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {borradores.map((borrador) => (
                        <div key={borrador.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-white font-medium">{borrador.nombre || 'Sin nombre'}</p>
                                <p className="text-gray-300 text-sm">{borrador.email || 'Sin email'}</p>
                                <p className="text-gray-400 text-xs">
                                    Guardado {new Date(borrador.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cargarBorrador(borrador);
                                    }}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900 rounded transition-all duration-200"
                                    title="Continuar con esta invitación"
                                >
                                    <FiPlay size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarBorrador(borrador.id);
                                    }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-all duration-200"
                                    title="Eliminar borrador"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="text-center pt-2">
                        <button
                            onClick={() => {
                                borradores.forEach(b => localStorage.removeItem(b.id));
                                setBorradores([]);
                                toast.success('Todos los borradores eliminados');
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                            Limpiar todos los borradores
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BorradoresPanel;