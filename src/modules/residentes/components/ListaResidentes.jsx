import React from 'react';
import { FiRefreshCw, FiEdit, FiUserX, FiUserCheck } from 'react-icons/fi';
import { getEstadoBadge } from '../utils/residentes.utils';

/**
 * @description Componente que muestra la lista de residentes en formato de tabla
 * Incluye filtros de búsqueda, estado, y acciones de gestión
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.residentes - Lista filtrada de residentes a mostrar
 * @param {boolean} props.isLoading - Estado de carga
 * @param {string} props.searchTerm - Término de búsqueda actual
 * @param {Function} props.onSearchChange - Función para actualizar búsqueda
 * @param {string} props.filtroEstado - Filtro de estado actual
 * @param {Function} props.onFiltroChange - Función para actualizar filtro
 * @param {Function} props.onRefresh - Función para recargar datos
 * @returns {JSX.Element} Tabla de residentes con controles
 */
const ListaResidentes = ({
    residentes,
    isLoading,
    searchTerm,
    onSearchChange,
    filtroEstado,
    onFiltroChange,
    onRefresh,
    onEditar,
    onSuspender,
    eliminandoId
}) => {

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* HEADER: Controles de filtro y búsqueda */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o unidad..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 items-center">
                        <select
                            value={filtroEstado}
                            onChange={(e) => onFiltroChange(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activos">Solo activos</option>
                            <option value="inactivos">Solo pendientes</option>
                        </select>

                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                            title="Actualizar lista"
                            aria-label="Actualizar lista de residentes"
                        >
                            {isLoading ? (
                                <FiRefreshCw className="animate-spin" size={16} aria-hidden="true" />
                            ) : (
                                <FiRefreshCw size={16} aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLA: Lista de residentes */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    // SKELETON LOADING
                    <div className="p-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mr-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                ) : residentes.length === 0 ? (
                    // ESTADO VACÍO
                    <div className="p-12 text-center">
                        <i className="fas fa-users text-gray-400 dark:text-gray-600 text-4xl mb-4"></i>
                        <h3 className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">No hay residentes</h3>
                        <p className="text-gray-500 dark:text-gray-500">
                            {searchTerm || filtroEstado !== 'todos'
                                ? 'No se encontraron residentes con los filtros aplicados'
                                : 'Aún no has invitado a ningún residente'
                            }
                        </p>
                    </div>
                ) : (
                    // TABLA DE DATOS
                    <table className="w-full">
                                <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Residente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Unidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {residentes.map((residente) => {
                                const estadoBadge = getEstadoBadge(residente.estado);
                                return (
                                    <tr key={residente.id} className="bg-gray-50/30 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {residente.nombre && residente.apellido
                                                        ? `${residente.nombre} ${residente.apellido}`
                                                        : residente.nombre || 'Sin nombre'
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {residente.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {residente.numero_unidad || 'Sin asignar'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoBadge.color}`}>
                                                <i className={`${estadoBadge.icono} mr-1`}></i>
                                                {estadoBadge.texto}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                                {residente.rol || 'residente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEditar(residente)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1"
                                                    title="Editar residente"
                                                    aria-label={`Editar residente ${residente.nombre} ${residente.apellido}`}
                                                >
                                                    <FiEdit size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    onClick={() => onSuspender(residente)}
                                                    disabled={eliminandoId === residente.id}
                                                    className={`transition-colors duration-200 disabled:opacity-50 p-1 ${
                                                        residente.estado === 'suspendido'
                                                            ? 'text-green-500 hover:text-green-700'
                                                            : 'text-orange-500 hover:text-orange-700'
                                                    }`}
                                                    title={residente.estado === 'suspendido' ? 'Reactivar residente' : 'Suspender residente'}
                                                    aria-label={residente.estado === 'suspendido' ? `Reactivar residente ${residente.nombre} ${residente.apellido}` : `Suspender residente ${residente.nombre} ${residente.apellido}`}
                                                >
                                                    {eliminandoId === residente.id ? (
                                                        <FiRefreshCw className="animate-spin" size={16} aria-hidden="true" />
                                                    ) : residente.estado === 'suspendido' ? (
                                                        <FiUserCheck size={16} aria-hidden="true" />
                                                    ) : (
                                                        <FiUserX size={16} aria-hidden="true" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* FOOTER: Información de resultados */}
            {!isLoading && residentes.length > 0 && (
                <div className="px-6 py-3 bg-gray-200 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {residentes.length} residente{residentes.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ListaResidentes;