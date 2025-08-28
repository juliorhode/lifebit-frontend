import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { STYLES } from '../../utils/styleConstants'
import SortableBlock from './SortableBlock';
import { FiMove, FiTrash2 } from 'react-icons/fi'; 

/**
 * @description El "lienzo" donde se pueden soltar los bloques.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {string} props.id - El ID único de esta zona de destino.
 * @param {Array<{id: string, text: string}>} props.items - Los bloques que ya han sido soltados aquí.
 * @returns {JSX.Element}
 */
const DroppableCanvas = ({ id, items, onClear }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div ref={setNodeRef} className={`${STYLES.dnd.canvasBase} ${isOver ? STYLES.dnd.canvasHover : STYLES.dnd.canvasDefault}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className={STYLES.dnd.paletteTitle}>Tu Nomenclatura</h3>
                {/* --- 2. BOTÓN DE LIMPIAR --- */}
                {/* Solo se muestra si hay items en el lienzo */}
                {items.length > 0 && (
                    <button
                        onClick={onClear}
                        className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Limpiar lienzo"
                    >
                        <FiTrash2 size={16} />
                    </button>
                )}
            </div>

            {/* --- ENVOLVEMOS LA LISTA EN EL SORTABLE CONTEXT --- */}
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>

                <div className={STYLES.dnd.canvasContent}>
                    {items.length > 0 ? (
                        items.map(item => <SortableBlock key={item.id} id={item.id} text={item.text} />)
                    ) : (
                        <div className={STYLES.dnd.canvasPlaceholder}>
                            <FiMove size={32} className="mb-2" />
                            <span className="text-sm">Arrastra los bloques de la paleta aquí</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

export default DroppableCanvas;