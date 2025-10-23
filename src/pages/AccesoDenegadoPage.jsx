import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';

/**
 * @description Página que se muestra cuando un usuario autenticado intenta acceder a una
 * ruta para la cual no tiene los permisos de rol necesarios (Error 403 Forbidden).
 * Sigue el estilo visual de la página de Login para consistencia.
 *
 * @returns {JSX.Element}
 */
const AccesoDenegadoPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 dark">
            <div className="w-full max-w-md text-center">

                {/* Usamos el Logo para mantener la identidad de marca */}
                <div className="flex justify-center mb-8">
                    <Logo  />
                </div>

                <h1 className="text-4xl font-bold text-red-500">
                    403 - Acceso Denegado
                </h1>

                <p className="mt-4 text-lg text-gray-400 max-w-md mx-auto">
                    No tienes los permisos necesarios para acceder a este recurso.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                    Si crees que esto es un error, por favor contacta al administrador de tu edificio.
                </p>

                <Link
                    to="/dashboard"
                    className="mt-8 inline-block btn-primary px-8" // Usamos clases semánticas
                >
                    Volver a mi Dashboard
                </Link>
            </div>
        </div>
    );
};

export default AccesoDenegadoPage;