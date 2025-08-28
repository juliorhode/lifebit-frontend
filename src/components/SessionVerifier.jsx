/* 
Propósito: Este componente es un "trabajador silencioso". No es visual. Su única responsabilidad es ejecutar la lógica de verificación de sesión una sola vez cuando la aplicación se carga.
Lógica (useEffect): Usaremos el hook useEffect con un array de dependencias vacío ([]). Esto es un patrón fundamental en React que significa: "Ejecuta el código que está aquí dentro solo una vez, justo después de que este componente se renderice por primera vez, y nunca más".
Acción: Dentro de ese useEffect, haremos una sola cosa: llamar a la acción refreshToken() de nuestro authStore.
Contenido (children): Este componente no renderizará nada por sí mismo. Simplemente actuará como un "envoltorio" (wrapper) para el resto de nuestra aplicación. Renderizará la prop children, que en nuestro caso, será todo nuestro sistema de rutas.
*/
import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * @description Componente "invisible" que se encarga de verificar y restaurar
 * la sesión del usuario al cargar la aplicación por primera vez.
 * Llama a la acción `refreshToken` del `authStore` una sola vez.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos a renderizar.
 * @returns {React.ReactNode} Renderiza a sus hijos.
 */
const SessionVerifier = ({ children }) => {
    // Obtenemos la acción refreshToken y el estado actual de nuestro store.
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const estado = useAuthStore((state) => state.estado);

    // useEffect con un array de dependencias vacío se ejecuta solo una vez.
    useEffect(() => {
        // Solo intentamos refrescar el token si estamos en el estado inicial.
        // Esto previene que se vuelva a llamar si el componente, por alguna
        // razón extraña, se volviera a montar.
        if (estado === 'initial') {
            refreshToken();
        }
    }, [refreshToken, estado]); // Dependemos de la función y el estado para la ejecución inicial.

    // Este componente no renderiza ninguna UI por sí mismo.
    // Simplemente renderiza los componentes que envuelve.
    return children;
};

export default SessionVerifier;