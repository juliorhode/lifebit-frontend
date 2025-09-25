import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlay } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/**
 * @description Panel que muestra invitaciones de residentes guardadas como borradores
 * Aplica el principio de Zeigarnik mostrando tareas pendientes para motivar completación
 * Los borradores se almacenan en localStorage con expiración automática
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCargarBorrador - Función para cargar un borrador en el modal
 * @param {number} props.refreshTrigger - Trigger para refrescar la lista de borradores
 * @returns {JSX.Element} Panel de borradores o null si no hay borradores
 */
const BorradoresPanel = ({ onCargarBorrador, refreshTrigger = 0 }) => {
    const [borradores, setBorradores] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // CARGA INICIAL Y REFRESCO: Obtener borradores desde localStorage
    useEffect(() => {
        cargarBorradores();
    }, [refreshTrigger]); // ✅ NUEVO: Se ejecuta cuando refreshTrigger cambia

    /**
     * @description Carga borradores desde localStorage y filtra expirados
     */
    const cargarBorradores = () => {
        console.log('📂 BorradoresPanel.cargarBorradores - INICIO');
        try {
            const borradoresGuardados = [];
            const ahora = Date.now();
            console.log('📂 Timestamp actual:', ahora);

            // Buscar todas las claves que empiecen con 'borrador_residente_'
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    console.log('📂 Encontrada clave:', key);
                    try {
                        const borrador = JSON.parse(localStorage.getItem(key));
                        console.log('📂 Borrador parseado:', borrador);

                        // Verificar si no ha expirado (7 días máximo)
                        const tiempoTranscurrido = ahora - borrador.timestamp;
                        const tiempoMaximo = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

                        console.log('📂 Verificando expiración:', {
                            timestamp: borrador.timestamp,
                            tiempoTranscurrido,
                            tiempoMaximo,
                            diferencia: tiempoMaximo - tiempoTranscurrido,
                            haExpirado: tiempoTranscurrido > tiempoMaximo,
                            timestampValido: !isNaN(borrador.timestamp) && borrador.timestamp > 0
                        });

                        // Verificar si el timestamp es válido y no ha expirado
                        const timestampValido = !isNaN(borrador.timestamp) && borrador.timestamp > 0;
                        const noExpirado = tiempoTranscurrido <= tiempoMaximo;

                        if (timestampValido && noExpirado) {
                            console.log('📂 Borrador válido, agregando a lista');
                            borradoresGuardados.push({
                                id: key,
                                ...borrador
                            });
                        } else {
                            console.log('📂 Borrador inválido/expirado, eliminando:', {
                                razon: timestampValido ? 'expirado' : 'timestamp inválido',
                                timestamp: borrador.timestamp
                            });
                            // Limpiar borradores expirados o con timestamp inválido
                            localStorage.removeItem(key);
                        }
                    } catch (error) {
                        console.log('📂 Error parseando borrador, eliminando');
                        // Si hay error al parsear, limpiar el item corrupto
                        localStorage.removeItem(key);
                    }
                }
            }

            console.log('📂 Borradores válidos encontrados:', borradoresGuardados.length);
            setBorradores(borradoresGuardados);
            console.log('📂 BorradoresPanel.cargarBorradores - FIN');
        } catch (error) {
            console.error('📂 Error al cargar borradores:', error);
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
            // ✅ INCLUIR el ID del borrador para mantener consistencia
            const { timestamp, ...datosFormulario } = borrador;

            onCargarBorrador(datosFormulario);
            toast.success('Borrador cargado en el formulario');
        }
    };

    // NO RENDERIZAR: Si no hay borradores, no mostrar el panel
    if (borradores.length === 0) {
        return null;
    }

    return (
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 border-l-4 border-blue-500 p-4 shadow-sm">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center">
                    <i className="fas fa-sticky-note text-blue-500 dark:text-blue-400 mr-3 text-lg"></i>
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold">
                            Tienes {borradores.length} borrador{borradores.length !== 1 ? 'es' : ''} pendiente{borradores.length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {isExpanded ? 'Haz clic para contraer' : 'Invitaciones sin completar - ¡No las olvides!'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-600 text-blue-900 dark:text-blue-100 text-xs px-2 py-1 rounded-full mr-3">
                        {borradores.length}
                    </span>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-blue-500 dark:text-blue-400 transition-transform duration-200`}></i>
                </div>
            </div>

            {/* CONTENIDO EXPANDIBLE: Lista de borradores */}
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {borradores.map((borrador) => (
                        <div key={borrador.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between border border-gray-200 dark:border-gray-600">
                            <div className="flex-1">
                                <p className="text-gray-900 dark:text-white font-medium">{borrador.nombre || 'Sin nombre'}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{borrador.email || 'Sin email'}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Guardado {new Date(borrador.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cargarBorrador(borrador);
                                    }}
                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded transition-all duration-200"
                                    title="Continuar con esta invitación"
                                    aria-label="Continuar con la invitación de residente"
                                >
                                    <FiPlay size={16} aria-hidden="true" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarBorrador(borrador.id);
                                    }}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded transition-all duration-200"
                                    title="Eliminar borrador"
                                    aria-label="Eliminar borrador de invitación"
                                >
                                    <FiTrash2 size={16} aria-hidden="true" />
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
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
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