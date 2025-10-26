import React from 'react';
import { FaCar, FaHome, FaCheckCircle, FaKey, FaBicycle, FaCube, FaRss, FaLock, FaLockOpen, FaUser, FaSuitcase, FaWarehouse, FaCheck, FaTools, FaExclamationTriangle, FaDumbbell, FaSwimmingPool, FaParking, FaBox, FaSeedling, FaBoxOpen } from 'react-icons/fa';
import { MdFitnessCenter, MdLocalLaundryService,  MdVpnKey, MdLock, MdMeetingRoom, MdSettingsRemote, MdPool,} from 'react-icons/md';
import { LuCodesandbox } from 'react-icons/lu';

/**
 * @description Mapeo de tipos de recursos a sus iconos representativos.
 * Las keys están en minúsculas para evitar problemas de case sensitivity.
 */
const iconosPorTipo = {
    'sala de reuniones': <MdMeetingRoom size={28} />,
    'lavandería': <MdLocalLaundryService size={28} />,
    'piscina': <FaSwimmingPool size={28} />,
    'jardín': <FaSeedling size={28}/>,
    'control remoto': <MdSettingsRemote size={28} />,
    'llave magnética': <FaKey size={28} />,
    'piscina': <MdPool size={28} />,
    'gimnasio': <FaDumbbell size={28} />,
    // Agrega más tipos de recursos y sus iconos aquí según sea necesario.
    // Icono por defecto para tipos no sugeridos
    default: <LuCodesandbox size={28} />,
};

/**
 * @description Iconos dinámicos que cambian según el estado del recurso.
 * Permite mayor expresividad visual para tipos específicos.
 */
const iconosDinamicos = {
    'estacionamiento': {
        disponible: <FaWarehouse size={28} />,
        ocupado: <FaCar size={28} />,
        seleccionado: <FaWarehouse size={28} />
    },
    'casillero': {
        disponible: <FaLockOpen size={28} />,
        ocupado: <FaLock size={28} />,
        seleccionado: <FaLockOpen size={28} />
    },
    'bicicletero': {
        disponible: <FaBicycle size={28} />,
        ocupado: <FaUser size={28} />,
        seleccionado: <FaBicycle size={28} />
    },
    'maletero / depósito': {
        disponible: <FaBoxOpen size={28} />,
        ocupado: <FaBox size={28} />,
        seleccionado: <FaBoxOpen size={28} />
    },
};

/**
 * @description Función helper para obtener icono dinámico por tipo y estado.
 * @param {string} tipo - Nombre del tipo de recurso
 * @param {string} estado - Estado del recurso (disponible, ocupado, seleccionado)
 * @returns {JSX.Element|null} Icono correspondiente o null si no encontrado
 */
const getIconoDinamico = (tipo, estado) => {
    return iconosDinamicos[tipo?.toLowerCase()]?.[estado];
};

/**
 * @description Mapeo centralizado de los estados visuales de una tarjeta a sus clases de estilo.
 * Incluye estados para ambos modos: 'asignacion' e 'inventario'.
 */
const cardStates = {
    /** Estado para un recurso que no está asignado a ninguna unidad. */
    disponible: {
        bg: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
        glow: 'hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]',
        iconColor: 'text-green-400',
        icon: <FaCar size={28} />,
    },
    /** Estado para un recurso que ya está asignado a una unidad. */
    ocupado: {
        bg: 'bg-gray-50 dark:bg-gray-800 border-red-300 dark:border-red-800/50',
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
    // Nuevos estados para modo 'inventario'
    operativo: {
        bg: 'bg-gray-50 dark:bg-gray-800 border-green-500/50 dark:border-green-700/50',
        glow: 'hover:border-green-500',
    },
    'en_mantenimiento': {
        bg: 'bg-gray-50 dark:bg-gray-800 border-yellow-500/50 dark:border-yellow-600/50',
        glow: 'hover:border-yellow-500',
    },
    'no_operativo': {
        bg: 'bg-gray-50 dark:bg-gray-800 border-red-500/50 dark:border-red-700/50',
        glow: 'hover:border-red-500',
    },
};

/**
 * @description Mapeo para la configuración visual de los badges de estado operativo.
 * Es una función para mantener la consistencia con el patrón de `residentes.utils.js`.
 */
const getInventarioBadge = (estado) => {
    switch (estado) {
        case 'operativo':
            return { bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <FaCheck />, text: 'Operativo' };
        case 'en_mantenimiento':
            return { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400', icon: <FaTools />, text: 'Mantenim.' };
        case 'no_operativo':
            return { bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <FaExclamationTriangle />, text: 'No Operativo' };
        default:
            return null; // No retornar nada si el estado no es válido.
    }
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
const RecursoCard = ({ item, onClick, mode = 'asignacion' }) => {
    // El estado visual principal (para bordes, glow, etc.) prioriza el estado 'seleccionado'.
    // Si no está seleccionado, elige el estado relevante según el modo.
    let estadoVisual;
    if (item.estado === 'seleccionado') {
        estadoVisual = 'seleccionado';
    } else if (mode === 'inventario') {
        estadoVisual = item.estado_operativo;
    } else {
        estadoVisual = item.estado;
    }
    
    

    // Determina la configuración de estilo a usar, basándose en el estado del item. Si el estado no es válido, usa 'disponible' como fallback.
    // const stateConfig = cardStates[item.estado] || cardStates.disponible;
    const stateConfig = cardStates[estadoVisual] || cardStates.disponible;

    // Obtenemos la configuración del badge solo si estamos en modo 'inventario'.
    const badgeConfig = mode === 'inventario' ? getInventarioBadge(item.estado_operativo) : null;

    // Determina el icono a usar, basándose en el tipo de recurso.
    // Primero intenta icono dinámico por tipo y estado, luego fallback a icono simple por tipo
    const icono = getIconoDinamico(item.tipo_recurso, item.estado) ||
        iconosPorTipo[item.tipo_recurso?.toLowerCase()] ||
        iconosPorTipo.default;

    return (
        <div
            // accion al hacer click en la tarjeta
            onClick={() => onClick(item)}
            className={`
                p-3 sm:p-3 rounded-lg border-2 text-center transition-all duration-200 ease-in-out relative
                transform hover:-translate-y-1 active:scale-95 cursor-pointer
                ${stateConfig.bg}
                ${stateConfig.glow}
            `}
            role="button"
            aria-label={`Recurso ${item.identificador_unico}`}
        >
            {/* Sección superior: Muestra el identificador único del recurso y el ícono de 'check' si está seleccionado. */}
            <div className="flex justify-center items-center h-8">
                <p className="font-bold text-base sm:text-lg text-primary text-gray-800 dark:text-white" >{item.identificador_unico}</p>

                {/* El ícono de check solo es visible cuando el estado es 'seleccionado' */}
                {item.estado === 'seleccionado' && (
                    <div className="absolute top-1 right-1">
                        <FaCheckCircle className="text-white bg-blue-600 rounded-full" />
                    </div>
                )}
            </div>

            {/* --- SECCIÓN MEDIA: ICONO PRINCIPAL --- */}
            <div className={`my-1 text-gray-800 dark:text-gray-300  ${stateConfig.iconColor}`}>
                {/* --- SECCIÓN INFERIOR: CONTENIDO DEPENDIENTE DEL MODO --- */}
                <div className={`flex justify-center ${stateConfig.iconColor}`}>
                    {icono}
                </div>
                {mode === 'asignacion' ? (
                    // MODO ASIGNACIÓN: Muestra el nombre de la unidad propietaria.
                    <p className={`text-xs mt-1 truncate h-4 font-semibold ${stateConfig.iconColor}`}>
                        {item.propietario_nombre || 'Disponible'}
                    </p>
                ) : (
                    // MODO INVENTARIO: Muestra el badge de estado y la ubicación.
                    <>
                        {badgeConfig && (
                                <div className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium min-w-0 ${badgeConfig.bg}`}>
                                    <span className="flex-shrink-0">{badgeConfig.icon}</span>
                                    <span className="truncate">{badgeConfig.text}</span>
                            </div>
                        )}
                        <p className="text-xs font-semibold text-tertiary truncate mt-1">
                            {item.ubicacion || 'Sin Ubicar'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecursoCard;
