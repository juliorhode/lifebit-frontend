import React from 'react';
import { FiMenu } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';
import { useAuthStore } from '../../store/authStore'; 

// Recibimos `onMenuClick` como una prop desde LayoutPrincipal
const Header = ({ onMenuClick }) => {
    // --- Leemos el estado del usuario directamente desde Zustand ---
    const usuario = useAuthStore((state) => state.usuario);

    // Si el usuario aún no ha cargado, podemos mostrar un estado de "Cargando..."
    // o simplemente placeholders elegantes para evitar parpadeos en la UI.
    if (!usuario) {
        return (
            <header className="flex h-16 flex-shrink-0 items-center justify-end border-b border-gray-800 bg-gray-900 px-4 sm:px-6 animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-700"></div>
                <div className="ml-4 h-10 w-10 rounded-full bg-gray-700"></div>
            </header>
        );
    }

    // Creamos variables para manejar el caso en que el usuario aún no ha cargado.
    const userName = `${usuario.nombre} ${usuario.apellido}`;
    const userRole = usuario?.rol;
    // TODO: Usar el avatar de Google si viene en el objeto 'usuario', o un placeholder.
    const userAvatarUrl = usuario?.avatarUrl || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=0D8ABC&color=fff`;

    return (
        // --- Clases para ambos modos ---
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6">
            <button
                type="button"
                // --- Clases para ambos modos ---
                className="rounded-md p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
                onClick={onMenuClick} 
            >
                <span className="sr-only">Abrir menú principal</span>
                <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex-1">
                <h1 className="hidden text-xl font-semibold text-gray-900 dark:text-white lg:block">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="relative">
                    <button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:ring-offset-gray-900">
                        <span className="sr-only">Abrir menú de usuario</span>
                        <img
                            src={userAvatarUrl}
                            alt="Avatar del usuario"
                            className="h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700"
                        />
                        <div className="hidden text-left md:block">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{userRole}</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;