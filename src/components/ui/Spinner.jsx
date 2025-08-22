import React from 'react';
import './Spinner.css'; // Importamos nuestro nuevo archivo de estilos

/**
 * Mapeo de los tipos de spinner a sus clases de CSS correspondientes.
 * Esto nos permite cambiar de spinner fácilmente a través de una prop.
 */
const loaderTypes = {
    ring1: 'loader-ring1',
    ring2: 'loader-ring2',
    ring3: 'loader-ring3',
    gears: 'loader-gears',
    dots_flash: 'loader-dots-flash',
    balls: 'loader-balls',
    // Aquí añadiremos los demás tipos...
};

/**
 * Componente reutilizable para mostrar animaciones de carga (spinners).
 * 
 * @param {object} props - Las propiedades del componente.
 * @param {string} [props.type='ring3'] - El tipo de spinner a mostrar. 'ring3' es el por defecto.
 * @returns {JSX.Element} Un elemento span con la clase del loader correspondiente.
 */
const Spinner = ({ type = 'ring3' }) => {
    // Prop 'type' con valor por defecto 'ring'
    // Validamos el tipo de spinner recibido y asignamos la clase correspondiente.
    // Si el tipo no está en nuestro mapeo, usamos 'ring' por defecto
    // Buscamos la clase de CSS en nuestro mapeo. Si no la encuentra, usa 'ring' por defecto.
    const loaderClass = loaderTypes[type] || loaderTypes.ring;

    return (
        <span className={loaderClass}></span> // Renderizamos un span con la clase del loader correspondiente.
    );
};

export default Spinner;