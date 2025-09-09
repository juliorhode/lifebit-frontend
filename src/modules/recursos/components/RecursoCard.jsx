import React from 'react';
import { FaCar, FaHome, FaCheckCircle } from 'react-icons/fa';

/**
 * @description Mapeo centralizado de los estados de un recurso a sus correspondientes clases de Tailwind CSS e íconos.
 * Esto permite una fácil personalización de la apariencia de la tarjeta y mantiene el componente principal limpio.
 */
const cardStates = {
    /** Estado para un recurso que no está asignado a ninguna unidad. */
    disponible: {
        bg: 'bg-gray-800 border-gray-700',
        glow: 'hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]',
        iconColor: 'text-green-400',
        icon: <FaCar size={28} />,
    },
    /** Estado para un recurso que ya está asignado a una unidad. */
    ocupado: {
        bg: 'bg-gray-800 border-red-800/50',
        glow: 'hover:border-red-600',
        iconColor: 'text-red-400',
        icon: <FaHome size={28} />,
    },
    /** Estado visual temporal para un recurso que ha sido seleccionado por el usuario en modo masivo. */
    seleccionado: {
        bg: 'bg-blue-600/50 border-blue-500 scale-105',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]',
        iconColor: 'text-white',
        icon: <FaCar size={28} />,
    },
};

/**
 * @description Tarjeta visual que representa un único recurso en la cuadrícula de asignación.
 * Es un componente puramente presentacional ("tonto") que recibe todo su estado y lógica como props.
 * Su apariencia cambia según el `estado` del `item` que se le pasa.
 * 
 * @param {object} props
 * @param {object} props.item - El objeto del recurso a renderizar. Debe contener `id`, `identificador_unico`, `propietario_nombre` y `estado`.
 * @param {function} props.onClick - Callback que se ejecuta cuando el usuario hace clic en la tarjeta, pasando el `item` completo.
 */
const RecursoCard = ({ item, onClick }) => {
    // Determina la configuración de estilo a usar, basándose en el estado del item. Si el estado no es válido, usa 'disponible' como fallback.
    const stateConfig = cardStates[item.estado] || cardStates.disponible;

    return (
        <div
            onClick={() => onClick(item)}
            className={`
                p-3 rounded-lg border-2 text-center transition-all duration-200 ease-in-out relative
                transform hover:-translate-y-1 active:scale-95 cursor-pointer
                ${stateConfig.bg} 
                ${stateConfig.glow}
            `}
        >
            {/* Sección superior: Muestra el identificador único del recurso y el ícono de 'check' si está seleccionado. */}
            <div className="flex justify-center items-center h-8">
                <p className="font-bold text-lg text-white">{item.identificador_unico}</p>

                {/* El ícono de check solo es visible cuando el estado es 'seleccionado' */}
                {item.estado === 'seleccionado' && (
                    <div className="absolute top-1 right-1">
                        <FaCheckCircle className="text-white bg-blue-600 rounded-full" />
                    </div>
                )}
            </div>

            {/* Sección inferior: Muestra el ícono principal y el nombre del propietario o 'Disponible'. */}
            <div className={`mt-1 ${stateConfig.iconColor}`}>
                {stateConfig.icon}
                <p className="text-xs mt-1 truncate h-4 font-semibold">
                    {item.propietario_nombre || 'Disponible'}
                </p>
            </div>
        </div>
    );
};

export default RecursoCard;
