/**
 * @file SolicitudCard.jsx
 * @description Componente presentacional puro ("tonto") que renderiza los datos de una
 * solicitud de servicio en formato de tarjeta. Está optimizado para ser legible y
 * funcional en pantallas móviles.
 * @see styleConstants.jsx - Utiliza constantes de este archivo para su estilo base.
 * @see solicitudes.utils.js - Importa lógica de presentación desde este archivo.
 * @param {object} props
 * @param {object} props.solicitud - El objeto completo con los datos de la solicitud a renderizar.
 * @returns {JSX.Element}
 */
import React from 'react';
// Importamos la función de lógica de presentación desde su archivo de utilidades dedicado.
// Esto mantiene nuestro componente "puro" y "tonto". Su única responsabilidad
// es mostrar cosas, no decidir cómo se ven.
import { getEstadoBadgeClasses } from '../utils/solicitudes.utils';
// Importamos nuestro sistema de diseño centralizado.
// Al usar STYLES, nos aseguramos de que esta tarjeta se vea consistente
// con el resto de la aplicación y sea fácil de mantener. Si cambiamos el estilo de
// 'cardCompact' en el futuro, esta tarjeta se actualizará automáticamente.
import { STYLES } from '../../../utils/styleConstants';

const SolicitudCard = ({ solicitud }) => {
    return (
        // Usamos la constante `cardCompact` que define la apariencia base de la tarjeta.
        // 'space-y-3' es una clase de utilidad de Tailwind que añade espacio vertical entre
        // los tres bloques principales de la tarjeta (info, detalles, acción).
        <div className={`${STYLES.cardCompact} space-y-3`}>

            {/* --- SECCIÓN SUPERIOR: Información Principal y Estado --- */}
            {/* (Layout con Flexbox):
          'flex' activa el layout flexible. 'justify-between' empuja los dos hijos
          (el div de info y el span de estado) a los extremos opuestos.
          'items-start' alinea los elementos en la parte superior de su contenedor. */}
            <div className="flex justify-between items-start">
                {/* Contenedor para la información del solicitante y el edificio */}
                <div>
                    <p className="text-sm font-bold text-primary">
                        {solicitud.nombre_solicitante} {solicitud.apellido_solicitante}
                    </p>
                    <p className="text-xs text-secondary">{solicitud.email_solicitante}</p>
                    <p className="text-sm text-tertiary mt-1">{solicitud.nombre_edificio}</p>
                </div>

                {/* Badge de Estado: una señal visual rápida */}
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClasses(solicitud.estado)}`}>
                    {solicitud.estado}
                </span>
            </div>

            {/* --- SECCIÓN MEDIA: Detalles Secundarios --- */}
            {/* 'border-t' y 'border-theme-light' crean nuestra línea separadora estándar. */}
            <div className="border-t  border-theme-light pt- space-y- text-sm">
                <div className="flex justify-between">
                    <span className="text-secondary">Plan Solicitado:</span>
                    <span className="font-medium text-primary">{solicitud.nombre_plan_solicitado}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Fecha:</span>
                    {/* (Formateo de Datos):
              Los componentes presentacionales a menudo necesitan hacer un formateo mínimo
              de los datos que reciben para que sean legibles. Convertir una fecha ISO
              (ej: "2024-10-29T14:30:00.000Z") a un formato local es una tarea
              apropiada para esta capa. */}
                    <span className="text-tertiary">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</span>
                </div>
            </div>

            {/* --- SECCIÓN INFERIOR: Botones de Acción --- */}
            <div className="pt-2">
                {/* Usamos nuestra constante de botón secundario genérico.
            'w-full' hace que el botón sea fácil de tocar en un dispositivo móvil. */}
                <button className={`${STYLES.buttonSecondaryGeneric} w-full`}>Ver Detalles</button>
            </div>
        </div>
    );
};

export default SolicitudCard; 