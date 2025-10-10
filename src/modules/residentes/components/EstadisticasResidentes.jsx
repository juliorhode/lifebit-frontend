/**
 * @description Componente presentacional ("tonto") que muestra las estadísticas generales de residentes.
 * Este componente ha sido refactorizado para no realizar ningún cálculo. Recibe un objeto
 * con las estadísticas ya procesadas y se limita a mostrarlas en la interfaz.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.estadisticas - Un objeto que contiene las métricas calculadas.
 * @param {number} props.estadisticas.total - El número total de residentes.
 * @param {number} props.estadisticas.activos - El número de residentes activos.
 * @param {number} props.estadisticas.pendientes - El número de residentes pendientes de activación.
 * @returns {JSX.Element} El panel de estadísticas renderizado.
 */
import React from 'react';

const EstadisticasResidentes = ({ estadisticas }) => {
    // Si la prop de estadísticas no está disponible, mostramos un estado de carga o vacío
    // para evitar el error 'Cannot read properties of undefined'.
    if (!estadisticas) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-200 dark:border-gray-700">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Ahora desestructuramos los valores directamente del objeto de estadísticas.
    const { total, activos, pendientes } = estadisticas;
    const porcentajeActivos = total > 0 ? Math.round((activos / total) * 100) : 0;
    // Clase base para las tarjetas para no repetir estilos comunes (DRY)
    const cardBaseStyle = `
        relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80
        border border-gray-200/60 dark:border-gray-700/60 border-l-4 border-l-green-500
        rounded-lg p-6 text-gray-900 dark:text-white
        shadow-lg hover:shadow-xl hover:shadow-green-500/25
        hover:scale-[1.02] hover:-translate-y-1
        transition-all duration-300 ease-out
        backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
        before:absolute before:inset-0 before:rounded-lg
        before:bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.03)_1px,transparent_0)]
        before:bg-[length:20px_20px] before:opacity-30 dark:before:opacity-10
        overflow-hidden cursor-pointer group
    `;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TOTAL DE RESIDENTES */}
            <div className={`${cardBaseStyle} border-l-4 border-l-blue-500 hover:shadow-blue-500/25`}>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Total Residentes</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <i className="fas fa-users text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES ACTIVOS */}
            <div className={`${cardBaseStyle} border-l-4 border-l-green-500 hover:shadow-green-500/25`}>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Residentes Activos</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activos}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{porcentajeActivos}% del total</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <i className="fas fa-user-check text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES PENDIENTES */}
            <div className={`${cardBaseStyle} border-l-4 border-l-yellow-500 hover:shadow-yellow-500/25`}>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Pendientes de Activación</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendientes}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Esperando aceptación</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                        <i className="fas fa-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasResidentes;