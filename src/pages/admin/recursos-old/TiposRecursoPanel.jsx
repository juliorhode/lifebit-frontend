import React from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { STYLES } from '../../../utils/styleConstants.jsx';

/**
 * @description Panel lateral para listar, seleccionar y crear "Tipos de Recurso".
 * Este es un componente "controlado", lo que significa que la lógica de estado principal
 * (qué tipos existen, cuál está seleccionado) es gestionada por su componente padre.
 *
 * @param {object} props
 * @param {Array<{id: number, nombre: string}>} props.tipos - Array de los tipos de recurso a mostrar.
 * @param {number|null} props.tipoSeleccionadoId - El ID del tipo actualmente seleccionado para resaltarlo.
 * @param {function} props.onSelectTipo - Callback que se ejecuta cuando el usuario hace clic en un tipo.
 * @param {function} props.onCrearTipo - Callback que se ejecuta al hacer clic en el botón '+'.
 * @param {boolean} props.isLoading - Booleano para indicar si los datos se están cargando.
 * @returns {JSX.Element}
 */
const TiposRecursoPanel = ({ tipos, tipoSeleccionadoId, onSelectTipo, onCrearTipo, isLoading }) => {

    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            {/* Cabecera del panel */}
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

            {/* Cuerpo del panel, con scroll si el contenido es muy largo */}
            <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-1"> {/* mr negativo para ocultar visualmente la barra de scroll */}
                {
                    /**
                     * Lógica de renderizado condicional para mostrar el estado correcto.
                     * Usamos un operador ternario anidado para manejar los 3 casos.
                     */
                    isLoading ? (
                        // --- ESTADO DE CARGA: UI ESQUELETO ---
                        // En lugar de un spinner, mostramos una versión "fantasma" de la lista. Asi evitamos el llamado "layout shift" 
                        // Esto reduce el "salto" de layout y mejora la percepción de velocidad.
                        // `animate-pulse` es una clase de Tailwind que crea un efecto de brillo sutil.
                        <div className="space-y-2 animate-pulse" aria-label="Cargando tipos de recurso...">
                            <div className="h-12 bg-gray-700 rounded-md"></div>
                            <div className="h-12 bg-gray-700 rounded-md"></div>
                            <div className="h-12 bg-gray-700 rounded-md"></div>
                        </div>
                    ) : tipos.length > 0 ? (
                        // --- ESTADO CON DATOS: La lista de tipos ---
                        <ul className="space-y-2">
                            {tipos.map((tipo) => (
                                <li key={tipo.id}>
                                    <button
                                        onClick={() => onSelectTipo(tipo.id)}
                                        className={`
                                        ${STYLES.selectableListItem.base} 
                                        ${tipo.id === tipoSeleccionadoId ? STYLES.selectableListItem.active : STYLES.selectableListItem.inactive}`}
                                    >
                                        {tipo.nombre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        // --- ESTADO VACÍO: Mensaje de bienvenida y guía ---
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