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
                    <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* TOTAL DE RESIDENTES */}
            <div className="bg-gray-800 border-l-4 border-blue-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300 text-sm font-medium">Total Residentes</p>
                        <p className="text-2xl font-bold text-blue-400">{totalResidentes}</p>
                    </div>
                    <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                        <i className="fas fa-users text-blue-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES ACTIVOS */}
            <div className="bg-gray-800 border-l-4 border-green-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300 text-sm font-medium">Residentes Activos</p>
                        <p className="text-2xl font-bold text-green-400">{residentesActivos}</p>
                        <p className="text-gray-400 text-xs">{porcentajeActivos}% del total</p>
                    </div>
                    <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                        <i className="fas fa-user-check text-green-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* RESIDENTES INACTIVOS */}
            <div className="bg-gray-800 border-l-4 border-yellow-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300 text-sm font-medium">Pendientes de Activación</p>
                        <p className="text-2xl font-bold text-yellow-400">{residentesInactivos}</p>
                        <p className="text-gray-400 text-xs">Esperando aceptación</p>
                    </div>
                    <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
                        <i className="fas fa-clock text-yellow-400 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* ESPACIO PARA MÉTRICA ADICIONAL */}
            <div className="bg-gray-800 border-l-4 border-purple-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300 text-sm font-medium">Invitaciones Enviadas</p>
                        <p className="text-2xl font-bold text-purple-400">{invitacionesEnviadas}</p>
                        <p className="text-gray-400 text-xs">Esta semana</p>
                    </div>
                    <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                        <i className="fas fa-envelope text-purple-400 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasResidentes;