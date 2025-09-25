import React from 'react';

/**
 * @description Componente que muestra estadísticas generales de residentes
 * Incluye métricas de total, activos, pendientes de activación, etc.
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.residentes - Lista completa de residentes (con campo 'estado')
 * @param {boolean} props.isLoading - Estado de carga de datos
 * @returns {JSX.Element} Panel de estadísticas
 */
const EstadisticasResidentes = ({ residentes, isLoading }) => {
    // CALCULOS: Métricas derivadas de la lista de residentes
    const totalResidentes = residentes.length;
    const residentesActivos = residentes.filter(r => r.estado === 'activo').length;
    const residentesInactivos = totalResidentes - residentesActivos;
    const porcentajeActivos = totalResidentes > 0 ? Math.round((residentesActivos / totalResidentes) * 100) : 0;

    // INVITACIONES ENVIADAS: Cada residente representa una invitación enviada
    const invitacionesEnviadas = totalResidentes;

    // LOADING STATE: Mostrar skeleton mientras carga
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-200 dark:border-gray-700">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* TOTAL DE RESIDENTES */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80
                          border border-gray-200/60 dark:border-gray-700/60 border-l-4 border-l-blue-500
                          rounded-lg p-6 text-gray-900 dark:text-white
                          shadow-lg hover:shadow-xl hover:shadow-blue-500/25
                          hover:scale-[1.02] hover:-translate-y-1
                          transition-all duration-300 ease-out
                          backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
                          before:absolute before:inset-0 before:rounded-lg
                          before:bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.03)_1px,transparent_0)]
                          before:bg-[length:20px_20px] before:opacity-30 dark:before:opacity-10
                          overflow-hidden cursor-pointer group">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Total Residentes</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{totalResidentes}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-500/20 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-full
                                  group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30
                                  group-hover:scale-110 transition-all duration-300">
                        <i className="fas fa-users text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES ACTIVOS */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80
                          border border-gray-200/60 dark:border-gray-700/60 border-l-4 border-l-green-500
                          rounded-lg p-6 text-gray-900 dark:text-white
                          shadow-lg hover:shadow-xl hover:shadow-green-500/25
                          hover:scale-[1.02] hover:-translate-y-1
                          transition-all duration-300 ease-out
                          backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
                          before:absolute before:inset-0 before:rounded-lg
                          before:bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.03)_1px,transparent_0)]
                          before:bg-[length:20px_20px] before:opacity-30 dark:before:opacity-10
                          overflow-hidden cursor-pointer group">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Residentes Activos</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">{residentesActivos}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{porcentajeActivos}% del total</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-500/20 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-full
                                  group-hover:bg-green-200 dark:group-hover:bg-green-500/30
                                  group-hover:scale-110 transition-all duration-300">
                        <i className="fas fa-user-check text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES INACTIVOS */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80
                          border border-gray-200/60 dark:border-gray-700/60 border-l-4 border-l-yellow-500
                          rounded-lg p-6 text-gray-900 dark:text-white
                          shadow-lg hover:shadow-xl hover:shadow-yellow-500/25
                          hover:scale-[1.02] hover:-translate-y-1
                          transition-all duration-300 ease-out
                          backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
                          before:absolute before:inset-0 before:rounded-lg
                          before:bg-[radial-gradient(circle_at_1px_1px,rgba(245,158,11,0.03)_1px,transparent_0)]
                          before:bg-[length:20px_20px] before:opacity-30 dark:before:opacity-10
                          overflow-hidden cursor-pointer group">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Pendientes de Activación</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors">{residentesInactivos}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Esperando aceptación</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-500/20 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-full
                                  group-hover:bg-yellow-200 dark:group-hover:bg-yellow-500/30
                                  group-hover:scale-110 transition-all duration-300">
                        <i className="fas fa-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* ESPACIO PARA MÉTRICA ADICIONAL */}
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/80
                          border border-gray-200/60 dark:border-gray-700/60 border-l-4 border-l-purple-500
                          rounded-lg p-6 text-gray-900 dark:text-white
                          shadow-lg hover:shadow-xl hover:shadow-purple-500/25
                          hover:scale-[1.02] hover:-translate-y-1
                          transition-all duration-300 ease-out
                          backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
                          before:absolute before:inset-0 before:rounded-lg
                          before:bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.03)_1px,transparent_0)]
                          before:bg-[length:20px_20px] before:opacity-30 dark:before:opacity-10
                          overflow-hidden cursor-pointer group">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Invitaciones Enviadas</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{invitacionesEnviadas}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Esta semana</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-500/20 bg-opacity-60 dark:bg-opacity-30 p-3 rounded-full
                                  group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30
                                  group-hover:scale-110 transition-all duration-300">
                        <i className="fas fa-envelope text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasResidentes;