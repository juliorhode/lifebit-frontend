/**
 * @description Componente que muestra la lista de residentes en formato de tabla.
 * Renderiza la lista filtrada de residentes y proporciona los controles para
 * búsqueda, filtrado por estado y acciones de gestión a nivel de fila.
 * La lógica de las acciones se delega a funciones pasadas como props desde el hook `useGestionResidentes`.
 *
 * PRINCIPIO DE SEGREGACIÓN DE INTERFACES (ISP) EN LA UX:
 * Este componente aplica el ISP a nivel de interfaz de usuario. Las acciones disponibles
 * para cada residente se adaptan a su estado. Por ejemplo, un usuario en estado 'invitado'
 * no mostrará la opción de "Suspender", ya que es una acción irrelevante y potencialmente
 * dañina para ese estado. Esto presenta al administrador una interfaz más limpia y segura,
 * previniendo errores de usuario.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.residentes - Lista filtrada de residentes a mostrar.
 * @param {boolean} props.isLoading - Estado de carga para mostrar un esqueleto.
 * @param {string} props.searchTerm - Término de búsqueda actual.
 * @param {Function} props.onSearchChange - Función para actualizar el término de búsqueda.
 * @param {string} props.filtroEstado - Filtro de estado actual ('todos', 'activos', etc.).
 * @param {Function} props.onFiltroChange - Función para actualizar el filtro de estado.
 * @param {Function} props.onRefresh - Función para recargar los datos.
 * @param {Function} props.onEditar - Función a llamar para editar un residente.
 * @param {Function} props.onSuspender - Función a llamar para suspender/reactivar un residente.
 * @param {string|null} props.idAccion - El ID del residente sobre el cual se está ejecutando una acción.
 * @returns {JSX.Element} La tabla de residentes con sus controles.
 */
import React from 'react';
import { FiRefreshCw, FiEdit, FiUserX, FiUserCheck } from 'react-icons/fi';
import { getEstadoBadge } from '../utils/residentes.utils';

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
    idAccion
}) => {

    return (
        <div className="card-theme overflow-hidden p-0"> {/* Usando .card-theme como base */}
            {/* HEADER: Controles de filtro y búsqueda */}
            <div className="p-4 md:p-6 border-b border-theme">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:max-w-md">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"></i>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o unidad..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input-theme pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 items-center w-full sm:w-auto">
                        <select
                            value={filtroEstado}
                            onChange={(e) => onFiltroChange(e.target.value)}
                            className="input-theme py-2 pr-8 w-full sm:w-auto" // pr-8 para que el texto no se solape con la flecha
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activos">Solo Activos</option>
                            <option value="inactivos">Solo Invitados/Suspendidos</option>
                        </select>

                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="p-2 btn-secondary"
                            title="Actualizar lista"
                        >
                            {isLoading ? <FiRefreshCw className="animate-spin" size={16} /> : <FiRefreshCw size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* CUERPO: Tabla o estados de carga/vacío */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    // Estado de Carga: Muestra un esqueleto para dar feedback visual al usuario.
                    <div className="p-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-4 py-3 border-b border-theme last:border-b-0">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : residentes.length === 0 ? (
                    // Estado Vacío: Se muestra cuando no hay residentes que coincidan con los filtros.
                    // Proporciona un mensaje claro y una llamada a la acción.
                    <div className="p-12 text-center text-tertiary">
                        <i className="fas fa-users text-4xl mb-4"></i>
                        <h3 className="text-lg font-medium text-secondary">
                            {searchTerm || filtroEstado !== 'todos' ? 'No se encontraron residentes' : 'Aún no hay residentes'}
                        </h3>
                        <p className="text-sm mt-1">
                            {searchTerm || filtroEstado !== 'todos' ? 'Intenta con otros filtros.' : 'Usa el botón "Invitar Residente" para empezar.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Vista de Tarjetas para Móviles */}
                        <div className="block md:hidden space-y-4 p-4">
                            {residentes.map((residente) => {
                                const estadoBadge = getEstadoBadge(residente.estado);
                                return (
                                    <div key={residente.id} className="bg-surface border border-theme rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-primary">
                                                    {`${residente.nombre || ''} ${residente.apellido || ''}`.trim() || 'Nombre no disponible'}
                                                </h3>
                                                <p className="text-tertiary text-sm">{residente.email}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoBadge.color}`}>
                                                <i className={`${estadoBadge.icono} mr-1.5`}></i>
                                                {estadoBadge.texto}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-secondary">
                                                <span className="text-sm font-medium">Unidad:</span> {residente.numero_unidad || 'N/A'}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEditar(residente)}
                                                    className="p-2 text-blue-500 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                                    title="Editar residente"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                {residente.estado !== 'invitado' && (
                                                    <button
                                                        onClick={() => onSuspender(residente)}
                                                        disabled={idAccion === residente.id}
                                                        className={`p-2 transition-colors disabled:opacity-50 rounded-full ${residente.estado === 'suspendido'
                                                                ? 'text-green-500 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                                                                : 'text-orange-500 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                                                            }`}
                                                        title={residente.estado === 'suspendido' ? 'Reactivar residente' : 'Suspender residente'}
                                                    >
                                                        {idAccion === residente.id ? (
                                                            <FiRefreshCw className="animate-spin" size={16} />
                                                        ) : residente.estado === 'suspendido' ? (
                                                            <FiUserCheck size={16} />
                                                        ) : (
                                                            <FiUserX size={16} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tabla de Datos para Desktop/Tablet */}
                        <table className="hidden md:table w-full text-sm text-left text-secondary">
                            <thead className="text-xs uppercase bg-surface-secondary text-tertiary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Residente</th>
                                    <th scope="col" className="px-6 py-3">Unidad</th>
                                    <th scope="col" className="px-6 py-3">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residentes.map((residente) => {
                                    const estadoBadge = getEstadoBadge(residente.estado);
                                    return (
                                        <tr key={residente.id} className="bg-surface border-b border-theme hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                            <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                                                <div>
                                                    {`${residente.nombre || ''} ${residente.apellido || ''}`.trim() || 'Nombre no disponible'}
                                                    <div className="font-normal text-tertiary">{residente.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-secondary">{residente.numero_unidad || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoBadge.color}`}>
                                                    <i className={`${estadoBadge.icono} mr-1.5`}></i>
                                                    {estadoBadge.texto}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* SOLUCIÓN DE ALINEACIÓN: Se usa un contenedor flex con ancho fijo para cada acción */}
                                                <div className="flex justify-end gap-1 items-center">
                                                    {/* Contenedor para la acción de Editar */}
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        <button
                                                            onClick={() => onEditar(residente)}
                                                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                                            title="Editar residente"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Contenedor para la acción de Suspender/Reactivar */}
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        {residente.estado !== 'invitado' ? (
                                                            <button
                                                                onClick={() => onSuspender(residente)}
                                                                disabled={idAccion === residente.id}
                                                                className={`p-1 transition-colors disabled:opacity-50 rounded-full ${residente.estado === 'suspendido'
                                                                        ? 'text-green-500 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                                                                        : 'text-orange-500 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                                                                    }`}
                                                                title={residente.estado === 'suspendido' ? 'Reactivar residente' : 'Suspender residente'}
                                                            >
                                                                {idAccion === residente.id ? (
                                                                    <FiRefreshCw className="animate-spin" size={16} />
                                                                ) : residente.estado === 'suspendido' ? (
                                                                    <FiUserCheck size={16} />
                                                                ) : (
                                                                    <FiUserX size={16} />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            // Este espacio vacío se renderiza si el botón no aplica, manteniendo la alineación.
                                                            null
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
};

export default ListaResidentes;