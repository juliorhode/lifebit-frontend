import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal';
import UpdatePasswordForm from '../auth/UpdatePasswordForm';

// Recibimos `onMenuClick` como una prop desde LayoutPrincipal
const Header = ({ onMenuClick, className='' }) => {
    // --- Leemos el estado del usuario directamente desde Zustand ---
    const usuario = useAuthStore((state) => state.usuario);
    const logout = useAuthStore((state) => state.logout);

    // Estado local para controlar la visibilidad del menú
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Estado para el modal de cambio de contraseña
    const [isUpdatePasswordOpen, setUpdatePasswordOpen] = useState(false);
    const menuRef = useRef(null); // Ref para detectar clics fuera del menú

    // 3. Lógica para cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        // Añadimos el listener cuando el menú está abierto
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        // Limpiamos el listener cuando el componente se desmonta o el menú se cierra
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Función para manejar el éxito del formulario
    const handlePasswordUpdateSuccess = (message) => {
        setUpdatePasswordOpen(false); // Cierra el modal
        alert(message); // Muestra un mensaje de éxito (lo mejoraremos luego)
    };

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
    
    
    const userAvatarUrl = usuario?.avatar_url || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=0D8ABC&color=fff`;

    return (
        <>

        {/* // --- Clases para ambos modos --- */}
            <header className={`flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 ${className}`}>
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
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:ring-offset-gray-900">
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
                        {/* 5. Renderizado condicional del menú desplegable */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate capitalize">{userRole}</p>
                                    </div>
                                    <Link
                                        to="/dashboard/mi-cuenta"
                                        onClick={() => setIsMenuOpen(false)} // Cierra el menú al navegar
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Mi Cuenta
                                    </Link>
                                    {/* --- BOTÓN PARA ABRIR EL MODAL --- */}
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false); // Cierra el menú desplegable
                                            setUpdatePasswordOpen(true); // Abre el modal
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cambiar Contraseña
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false); // Cierra el menú
                                            logout();             // Llama a la acción de logout
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {/* --- RENDERIZADO DEL MODAL --- */}
            <Modal
                isOpen={isUpdatePasswordOpen}
                onClose={() => setUpdatePasswordOpen(false)}
                title="Actualizar Contraseña"
            >
                <UpdatePasswordForm onSuccess={handlePasswordUpdateSuccess} onProcessingChange={() => { }} />
            </Modal>
        </>
    );
};

export default Header;