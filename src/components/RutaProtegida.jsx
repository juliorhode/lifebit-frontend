import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * @description Componente de orden superior que protege rutas.
 * Verifica el estado de autenticación del usuario desde el store.
 * - Si el usuario está logueado, renderiza el contenido de la ruta solicitada.
 * - Si no está logueado, redirige a la página de login.
 * - Mientras se verifica el estado, muestra un indicador de carga.
 * 
 * @returns {JSX.Element} El componente de la ruta hija, una redirección o un loader.
 */
const RutaProtegida = () => {
    // Leemos el estado de autenticación de nuestra única fuente de verdad.
    const estado = useAuthStore((state) => state.estado);

    // CASO 1: Aún estamos verificando la sesión (ej. al recargar la página).
    // Mostramos una pantalla de carga para evitar un parpadeo a la página de login.
    // 'initial' será un estado que añadiremos a nuestro store para la carga inicial.
    if (estado === 'loading' || estado === 'initial') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-white">Cargando aplicación...</p>
                    {/* Aquí podríamos poner un spinner/logo animado en el futuro */}
                </div>
            </div>
        );
    }

    // CASO 2: La verificación terminó y el usuario SÍ está autenticado.
    // Renderizamos el componente <Outlet />, que representa la ruta hija
    // a la que el usuario intentaba acceder (ej. <DashboardPage />).
    if (estado === 'loggedIn') {
        return <Outlet />;
    }

    // CASO 3: La verificación terminó y el usuario NO está autenticado.
    // Renderizamos el componente <Navigate />, que redirige al usuario.
    // El atributo 'replace' evita que la página de redirección se guarde en el historial
    // del navegador, para que el usuario no pueda "volver atrás" a la página protegida.
    return <Navigate to="/login" replace />;
};

export default RutaProtegida;