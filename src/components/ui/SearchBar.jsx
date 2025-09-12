import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { STYLES } from '../../utils/styleConstants';

/**
 * @description Componente de UI reutilizable para una barra de búsqueda con un icono.
 * Encapsula la lógica de posicionamiento para evitar conflictos de z-index
 * en los componentes que lo usan.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.value - El valor actual del campo de búsqueda (controlado desde el padre).
 * @param {function} props.onChange - La función a llamar cuando el valor del input cambia.
 * @param {string} props.placeholder - El texto a mostrar cuando el input está vacío.
 * @param {string} [props.className] - Clases de CSS opcionales para extender el estilo del contenedor.
 * @returns {JSX.Element}
 */
const SearchBar = ({ value, onChange, placeholder, className = '' }) => {
    return (
        // El `div` con `relative` es la clave. Crea el contexto de apilamiento
        // aquí, de forma aislada, para que el ícono pueda posicionarse
        // sin afectar al layout del componente padre.
        <div className={`relative ${className}`}>
            {/* El ícono se posiciona de forma absoluta DENTRO del div relativo.
            Las clases `top-1/2 -translate-y-1/2` lo centran verticalmente
            de una manera que se adapta a cualquier altura de input. */}
            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />

            {/* Usamos el estilo de input global de nuestro sistema de diseño.
            El `pl-10` es crucial para dejar espacio al ícono y evitar
            que el texto se escriba encima de él. */}
            <input
                type='text'
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${STYLES.input} pl-10`}
            />
        </div>
    );
};

export default SearchBar;