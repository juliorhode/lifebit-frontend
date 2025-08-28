import React from 'react';
import { STYLES} from '../../utils/styleConstants'

/**
 * @description Componente visual para un bloque arrastrable.
 * Es un componente "tonto" que solo muestra la apariencia.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {string} props.id - El identificador único del bloque.
 * @param {string} props.text - El texto a mostrar en el bloque.
 * @param {string} [props.className] - Clases de Tailwind adicionales.
 * @returns {JSX.Element}
 */

// Usamos React.forwardRef para pasar la referencia al div. Es un requisito de dnd-kit para que pueda "agarrar" el elemento del DOM correctamente.
const Block = React.forwardRef(({ text, className, isHidden, ...props }, ref) => {
    if (isHidden) {
        // Si está oculto, renderizamos un placeholder vacío que ocupa el mismo espacio
        return <div ref={ref} className="h-[42px] w-full rounded-md bg-gray-700/50" />;
    }
    return (
        <div
            ref={ref}
            {...props}
            className={`${STYLES.dnd.block} ${className || ''}`}
        >
            {text}
        </div>
    );
});

export default Block;