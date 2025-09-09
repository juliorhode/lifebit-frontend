import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Componente de Modal genérico y reutilizable.
 * Maneja la lógica de mostrar/ocultar el contenedor y el overlay,
 * pero el contenido y el estado de visibilidad son controlados por el componente padre.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isOpen - Booleano que determina si el modal está visible.
 * @param {function} props.onClose - Función a llamar cuando el usuario cierra el modal.
 * @param {string} props.title - El título que se mostrará en la cabecera del modal.
 * @param {React.ReactNode} props.children - El contenido JSX que se renderizará dentro del modal.
 * @returns {JSX.Element|null} El modal renderizado o null si no está abierto.
 */
const Modal = ({ isOpen, onClose, title, children, isProcessing = false }) => {
    // Efecto para prevenir el scroll del body cuando el modal está abierto.
    // Cuando el modal se monta o desmonta
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Evita que el usuario pueda hacer scroll en el fondo cuando el modal está abierto
        } else {
            document.body.style.overflow = 'unset'; // Restaura el comportamiento normal del scroll cuando el modal se cierra
        }

        // Función de limpieza que se ejecuta cuando el componente se desmonta.
        return () => {
            document.body.style.overflow = 'unset'; // Asegura que el scroll se restaure si el modal se desmonta sin cerrarse
        };
    }, [isOpen]); // Dependencia en 'isOpen' para aplicar el efecto solo cuando cambia el estado de visibilidad del modal.

    // Si el modal no está abierto, no renderizamos nada.
    if (!isOpen) {
        return null;
    }

    return (
        // El 'portal' del modal: un contenedor fijo que ocupa toda la pantalla.
        // `z-50` asegura que esté por encima de todo lo demás.
        // fixed inset - 0 hace que el overlay ocupe toda la pantalla del dispositivo, sin importar su tamaño.
        // flex items-center justify-center asegura que el contenido (el div del modal) siempre esté perfectamente centrado, tanto vertical como horizontalmente.
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
            onClick={!isProcessing ? onClose : undefined} // Cierra el modal al hacer clic en el fondo, solo funciona si NO estamos procesando
        >
            {/* El contenedor del modal en sí. */}
            {/* `onClick` con `e.stopPropagation()` previene que un clic DENTRO del modal lo cierre. */}
            <div
                // className="relative w-full max-w-lg ..." w-full: En pantallas muy pequeñas (móviles en vertical) el modal ocupa todo el ancho disponible. max-w-xl: En pantallas más grandes, el modal no se expandirá más allá de un ancho máximo (en este caso, lg o 36rem).
                // rounded-lg: Bordes redondeados para un aspecto más moderno.
                className="relative w-full max-w-xl rounded-lg bg-white dark:bg-gray-900 shadow-xl"
                onClick={(e) => e.stopPropagation()} // Evita que un clic dentro del modal cierre el modal.
            >
                {/* Cabecera del Modal */}
                <div className="flex items-start justify-center p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex-1 text-center">   
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {/* Título del Modal */}
                        {title}
                    </h3>
                    </div>
                    <button
                        onClick={!isProcessing ? onClose : undefined} // Solo cierra el modal si NO estamos procesando
                        disabled={isProcessing} // Deshabilita el botón si estamos procesando
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none disabled:opacity-10 disabled:cursor-not-allowed"
                        aria-label="Cerrar modal"
                    >
                        {/* Icono de cerrar modal */}
                        <FiX size={24} />
                    </button>
                </div>

                {/* Contenido del Modal (renderiza lo que sea que le pasen como 'children') */}
                {/* max-h-[80vh]: Le damos al contenido una altura máxima del 80% de la altura de la ventana (viewport height).
                overflow-y-auto: Si el contenido (nuestro formulario) supera esa altura, aparecerá una barra de scroll vertical DENTRO del modal, sin afectar al resto de la página. */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {/* Aquí se renderiza el contenido del modal, que puede ser cualquier JSX que le pase el componente padre. */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;