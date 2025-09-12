import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { STYLES } from '../../utils/styleConstants';
import { FiTrash2 } from 'react-icons/fi';

/**
 * @description Un contenedor genérico que puede actuar como una zona para
 * soltar elementos ('droppable') y como un contexto para ordenar
 * sus elementos hijos ('sortable'). Su única responsabilidad es actuar como un área de destino (droppable) y renderizar una lista de items ordenables (sortable).
 * 
 * @param {string} id - ID único para esta zona de destino.
 * @param {Array<{id: string}>} items - Array de los ítems que contiene.
 * @param {React.ReactNode} children - Los componentes <Item /> a renderizar.
 */
const Container = ({ id, items, children }) => {
    // Hook de dnd-kit que convierte a este componente en una zona de destino.
    const { isOver, setNodeRef } = useDroppable({ id });
    // Determinamos el estilo dinámicamente basado en si un elemento se está arrastrando sobre él.
    const style = `${STYLES.dnd.canvasBase} ${isOver ? STYLES.dnd.canvasHover : STYLES.dnd.canvasDefault}`;

    return (
        // `setNodeRef` le permite a dnd-kit "ver" este elemento en el DOM.
        <div ref={setNodeRef} className={style}>
            {/* SortableContext necesita saber los IDs de los items que contiene para gestionar la reordenación. */}
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
                {children}
            </SortableContext>
        </div>
    );
};


export default Container;