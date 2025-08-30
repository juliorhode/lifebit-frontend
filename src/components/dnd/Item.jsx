import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STYLES } from '../../utils/styleConstants.jsx';

/**
 * @description Representa un único ítem arrastrable y ordenable.
 * Este componente encapsula toda la lógica de 'dnd-kit' para un elemento individual,
 * haciendo que el componente padre sea mucho más limpio.
 * 
 * @param {string} id - ID único del ítem.
 * @param {string} text - Texto que muestra el ítem.
 */
const Item = ({ id, text }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging, // dnd-kit nos dice si este ítem específico se está arrastrando.
    } = useSortable({ id });

    // dnd-kit provee las transformaciones de CSS para el movimiento suave.
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Hacemos el ítem semi-transparente mientras se arrastra. El 'DragOverlay'
        // mostrará la versión 100% opaca, creando un efecto de "fantasma" limpio.
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes} // Props para que dnd-kit lo identifique.
            {...listeners} // Props para que dnd-kit pueda "escuchar" los eventos de drag (ratón, táctil).
            className={STYLES.dnd.block}
        >
            {text}
        </div>
    );
};

export default Item;