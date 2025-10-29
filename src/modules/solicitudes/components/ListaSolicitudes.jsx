// Ruta: src/modules/solicitudes/components/ListaSolicitudes.jsx
// VERSIÓN CON LAYOUT DE FILTROS REFINADO

import React from 'react';
import { FiRefreshCw, FiInbox, FiX, FiTrash } from 'react-icons/fi';
import SolicitudCard from './SolicitudCard';
import { STYLES } from '../../../utils/styleConstants';
import { getEstadoBadgeClasses } from '../utils/solicitudes.utils'; // Importamos la utilidad del badge

const ListaSolicitudes = ({
    solicitudes,
    isLoading,
    filtros,
    onFiltroChange,
    onRefresh,
    licencias,
}) => {
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        onFiltroChange({ ...filtros, [name]: value });
    };

    // Función para limpiar todos los filtros a la vez
    const limpiarFiltros = () => {
        onFiltroChange({ q: '', estado: '', licencia: '', fecha_desde: '', fecha_hasta: '' });
    };

    return (
        <div className="card-theme overflow-hidden p-0">
            {/* --- HEADER CON FILTROS REESTRUCTURADOS --- */}
            <div className="p-4 md:p-6 border-b border-theme space-y-4">

                {/* --- FILA 1: BÚSQUEDA PRIMARIA --- */}
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        name="q"
                        placeholder="Buscar por nombre, edificio, cédula..."
                        value={filtros.q}
                        onChange={handleFiltroChange}
                        className={`${STYLES.input} flex-grow h-11`} // `flex-grow` hace que ocupe el espacio disponible
                    />
                    <select
                        name="estado"
                        value={filtros.estado}
                        onChange={handleFiltroChange}
                        className={`${STYLES.input} py-2 pr-8 w-full md:w-52 h-11`} // Ancho fijo en escritorio
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>

                {/* --- FILA 2: BÚSQUEDA AVANZADA --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <select
                        name="licencia"
                        value={filtros.licencia}
                        onChange={handleFiltroChange}
                        className={`${STYLES.input} py-2 pr-8 w-full md:w-48 h-11`}
                    >
                        <option value="">Todos los planes</option>
                        {/* Aseguramos que `licencias` sea un array antes de mapear */}
                        {Array.isArray(licencias) && licencias.map(lic => (
                            <option key={lic.id} value={lic.id}>{lic.nombre_plan}</option>
                        ))}
                    </select>

                    {/* Contenedor para las fechas */}
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <input type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltroChange} className={`${STYLES.input} text-secondary h-11`} />
                        <input type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltroChange} className={`${STYLES.input} text-secondary h-11`} />
                    </div>

                    {/* Botones de acción para los filtros */}
                    <div className="flex gap-2">
                        <button onClick={onRefresh} disabled={isLoading} className={`${STYLES.buttonSecondaryGeneric} h-11 flex items-center`} title="Actualizar lista">
                            <FiRefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={limpiarFiltros} className={`${STYLES.buttonSecondaryGeneric} h-11 flex items-center`} title="Limpiar todos los filtros">
                            <FiTrash size={16} className="mr-1" /> 
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CUERPO: TABLA O TARJETAS (Sin cambios en esta sección) --- */}
            <div className="overflow-x-auto">
                {isLoading ? (<div className="p-6">{/* Esqueleto de Carga */}</div>
                ) : solicitudes.length === 0 ? (
                    // 2. ESTADO VACÍO: Muestra el mensaje amigable.
                    <div className="p-12 text-center text-tertiary">
                        <FiInbox className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-medium text-secondary mt-2">No se encontraron solicitudes</h3>
                        <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda o presiona el botón de refrescar.</p>
                    </div>
                ) : (
                    <>
                        {/* Vista de Tabla para Escritorio */}
                        <table className="hidden md:table w-full text-sm text-left text-secondary">
                            <thead className="text-xs uppercase bg-surface-secondary text-tertiary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Solicitante</th>
                                    <th scope="col" className="px-6 py-3">Edificio</th>
                                    <th scope="col" className="px-6 py-3">Plan</th>
                                    <th scope="col" className="px-6 py-3">Fecha</th>
                                    <th scope="col" className="px-6 py-3">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme">
                                {solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id} className="bg-surface hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                        <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                                            <div>{solicitud.nombre_solicitante} {solicitud.apellido_solicitante}
                                                <div className="font-normal text-tertiary">{solicitud.email_solicitante}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{solicitud.nombre_edificio}</td>
                                        <td className="px-6 py-4">{solicitud.nombre_plan_solicitado}</td>
                                        <td className="px-6 py-4">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClasses(solicitud.estado)}`}>
                                                {solicitud.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className={STYLES.buttonSecondaryGeneric}>Ver Detalles</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Vista de Tarjetas para Móvil */}
                        <div className="block md:hidden space-y-4 p-4">
                            {solicitudes.map((solicitud) => (
                                <SolicitudCard key={solicitud.id} solicitud={solicitud} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ListaSolicitudes;