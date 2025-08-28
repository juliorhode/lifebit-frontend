import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import Block from './Block';
import { STYLES } from '../../utils/styleConstants'
/**
 * @description Un único bloque de la paleta que se puede arrastrar.
 */
const DraggableBlock = ({ id, text }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: { text, isPaletteItem: true },
    });


    return (
        <Block
            ref={setNodeRef}
            text={text}
            isHidden={isDragging}
            {...listeners}
            {...attributes}
        />
    );
};


/**
 * @description La "caja de herramientas". Renderiza una lista de bloques arrastrables.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {Array<{id: string, text: string}>} props.items - La lista de bloques a mostrar.
 * @returns {JSX.Element}
 */
const DraggablePalette = ({ id, grupos, draggingItemId }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={STYLES.dnd.paletteContainer}>
            <h3 className={STYLES.dnd.paletteTitle}>Paleta de Bloques</h3>
            <div className="space-y-4">
                {grupos.map((grupo) => (
                    <div key={grupo.titulo}>
                        <p className="text-sm font-semibold text-gray-400 mb-2">{grupo.titulo}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {grupo.items.map(item => (
                                <DraggableBlock key={item.id} id={item.id} text={item.text} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DraggablePalette;