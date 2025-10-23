import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Spinner from './ui/Spinner';
import AccesoDenegadoPage from '../pages/AccesoDenegadoPage';

/**
 * @description Componente de guardia unificado. Protege rutas verificando tanto la
 * autenticación (si el usuario está logueado) como, opcionalmente, la autorización
 * (si el rol del usuario está en la lista de roles permitidos).
 *
 * @param {object} props
 * @param {Array<string>} [props.rolesPermitidos] - Si se proporciona, la ruta requerirá que
 * el usuario tenga uno de estos roles. Si se omite, solo se requiere autenticación.
 * @returns {JSX.Element} El `<Outlet />` para la ruta hija si está autorizado, o un `<Navigate />`.
 */

const RutaProtegida = ({ rolesPermitidos }) => {
    console.log('Roles permitidos:', rolesPermitidos);
    // Leemos el estado de autenticación de nuestra única fuente de verdad.
    const estado = useAuthStore((state) => state.estado);
    const rolUsuario = useAuthStore((state) => state.usuario?.rol);

    // CASO 1: Aún estamos verificando la sesión (ej. al recargar la página).
    // Mostramos una pantalla de carga para evitar un parpadeo a la página de login.
    // 'initial' será un estado que añadiremos a nuestro store para la carga inicial.
    if (estado === 'loading' || estado === 'initial') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-white">Cargando aplicación...</p>
                    <Spinner />
                </div>
            </div>
        );
    }

    // CASO 2: La verificación terminó y el usuario NO está autenticado.
    if (estado !== 'loggedIn') {
        return <Navigate to="/login" replace />;
    }
    
    // CASO 3: La ruta requiere roles específicos, pero el usuario no cumple.
    if (rolesPermitidos && rolesPermitidos.length > 0) {
        console.log('[RBAC] Verificando roles para la ruta protegida...');
        
        if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
            // El usuario está logueado pero no tiene el rol correcto para esta ruta.
            console.warn(`[RBAC] Acceso denegado a la ruta. Rol del usuario: '${rolUsuario}'. Roles permitidos: [${rolesPermitidos.join(', ')}]`);
            return <Navigate to="/acceso-denegado" replace />;
        }
    }
    // CASO 4: La verificación terminó y el usuario SÍ está autenticado.
    // Renderizamos el componente <Outlet />, que representa la ruta hija
    // a la que el usuario intentaba acceder (ej. <DashboardPage />).
    if (estado === 'loggedIn') {
        return <Outlet />;
    }
    
};

export default RutaProtegida;