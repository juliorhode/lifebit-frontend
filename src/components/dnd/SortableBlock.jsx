import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Block from './Block';

/**
 * @description Un componente Block que se puede ordenar dentro de un SortableContext.
 */
const SortableBlock = ({ id, text }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id, data: { isCanvasItem: true } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Block
            ref={setNodeRef}
            style={style}
            id={id}
            text={text}
            {...attributes}
            {...listeners}
        />
    );
};

export default SortableBlock;