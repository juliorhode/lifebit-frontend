import React from 'react';
import { FiEdit2, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import { STYLES } from '../../../utils/styleConstants.jsx';

/**
 * @description Panel lateral que muestra una lista de los "Tipos de Recurso" disponibles.
 * Permite al usuario seleccionar un tipo para ver su inventario o iniciar el proceso de creación de un nuevo tipo.
 * @param {object} props
 * @param {Array<object>} props.tipos - La lista de objetos de tipo de recurso a mostrar.
 * @param {number|null} props.tipoSeleccionadoId - El ID del tipo de recurso actualmente seleccionado, para resaltarlo en la lista.
 * @param {function} props.onSelectTipo - Callback que se ejecuta cuando el usuario hace clic en un tipo, pasando el ID del tipo.
 * @param {function} props.onCrearTipo - Callback que se ejecuta cuando el usuario hace clic en el botón de añadir.
 * @param {function(object): void} props.onEditarTipo - Callback que se ejecuta cuando el usuario quiere editar un tipo existente.
 * @param {function(object): void} props.onEliminarTipo - Callback que se ejecuta cuando el usuario quiere eliminar un tipo existente.
 * @param {boolean} props.isLoading - Si es `true`, muestra un esqueleto de carga en lugar de la lista.
 */
const TiposRecursoPanel = ({ tipos, tipoSeleccionadoId, onSelectTipo, onCrearTipo, isLoading, onEditarTipo,onEliminarTipo }) => {
    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            {/* Cabecera del panel: Título y botón para añadir nuevo tipo */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-700 flex-shrink-0">
                <h2 className={STYLES.titleSection}>Tipos de Recurso</h2>
                <button
                    onClick={onCrearTipo}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Añadir nuevo tipo de recurso"
                >
                    <FiPlusCircle size={24} />
                </button>
            </div>

            {/* Cuerpo del panel: Contiene la lista y es desplazable si el contenido excede la altura. */}
            <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
                {/* Renderizado condicional basado en el estado de carga y la existencia de datos */}
                {isLoading ? (
                    // 1. Muestra un esqueleto de carga mientras se obtienen los datos.
                    <div className="space-y-2 animate-pulse" aria-label="Cargando tipos de recurso...">
                        {/* <div className="h-12 bg-gray-700 rounded-md"></div>
                        <div className="h-12 bg-gray-700 rounded-md"></div>
                        <div className="h-12 bg-gray-700 rounded-md"></div> */}
                        {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-700 rounded-md"></div>)}
                    </div>
                ) : tipos.length > 0 ? (
                    // 2. Muestra la lista de tipos si existen.
                    <ul className="space-y-2">
                        {tipos.map((tipo) => (
                            <li key={tipo.id} className="group flex items-center gap-2">
                                <button
                                    // flex-grow` para que ocupe el espacio disponible
                                    onClick={() => onSelectTipo(tipo.id)}
                                    className={`
                                        flex-grow
                                        ${STYLES.selectableListItem.base} 
                                        ${/* Aplica un estilo diferente si el item está seleccionado */''}
                                        ${tipo.id === tipoSeleccionadoId ? STYLES.selectableListItem.active : STYLES.selectableListItem.inactive}`}
                                >
                                    {tipo.nombre}
                                </button>
                                {/* CONTENEDOR PARA LOS ICONOS DE ACCIÓN */}
                                <div className="flex items-center flex-shrink-0">
                                    {/* Los iconos son invisibles (`opacity-0`) por defecto.
                                        `group-hover:opacity-100` los hace visibles cuando el cursor
                                        está sobre el `li` que tiene la clase `group`. */}
                                    <button
                                        onClick={() => onEditarTipo(tipo)}
                                        // Lógica de clases:
                                        // `opacity-100`:      Visible por defecto (móvil).
                                        // `md:opacity-0`:     Oculto en pantallas medianas o más grandes.
                                        // `group-hover:opacity-100`: Vuelve a ser visible en pantallas grandes SÓLO al hacer hover.
                                        className="p-2 text-gray-500 hover:text-blue-400 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                        aria-label={`Editar ${tipo.nombre}`}
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onEliminarTipo(tipo)}
                                        // Lógica de clases de color:
                                        // `text-red-500`:         Color rojo por defecto (móvil).
                                        // `md:text-gray-500`:     Se vuelve gris en pantallas medianas o más grandes.
                                        // `hover:text-red-400`:   El hover a rojo brillante se mantiene para escritorio.
                                        className="p-2 text-red-500 md:text-gray-500 hover:text-red-400 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                        aria-label={`Eliminar ${tipo.nombre}`}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    // 3. Muestra un mensaje de bienvenida si no hay tipos de recurso creados.
                    <div className="text-center text-gray-500 py-8 px-4 h-full flex flex-col justify-center items-center">
                        <p className="font-semibold">Empieza por aquí</p>
                        <p className="text-sm mt-1">
                            Crea tu primera categoría de recurso haciendo clic en el icono <FiPlusCircle className="inline-block mx-1" /> de arriba.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TiposRecursoPanel;
