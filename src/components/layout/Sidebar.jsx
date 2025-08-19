import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiUsers, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { FaFileContract } from "react-icons/fa";

// NOTA: Los datos de los enlaces son estáticos por ahora para construir la UI.
// Más adelante, esta lista se generará dinámicamente según el rol del usuario.
const navLinks = [
    { to: '/dashboard', icon: <FiGrid size={20} />, text: 'Dashboard' },
    { to: '/contratos', icon: <FaFileContract size={20} />, text: 'Contratos' },
    { to: '/residentes', icon: <FiUsers size={20} />, text: 'Residentes' },
];
const bottomLinks = [
    { to: '/mi-cuenta', icon: <FiSettings size={20} />, text: 'Mi Cuenta' },
    { to: '/ayuda', icon: <FiHelpCircle size={20} />, text: 'Ayuda' },
    { to: '/logout', icon: <FiLogOut size={20} />, text: 'Salir' },
];
/**
 * @description Componente de la barra lateral de navegación.
 * Es responsivo: se muestra de forma fija en pantallas grandes y se oculta en móviles.
 * 
 * @returns {JSX.Element} La barra lateral.
 */

const Sidebar = ({ isOpen, onLinkClick }) => {
    // Definimos un único estilo base que ya incluye las variantes dark:
    const linkStyle = "flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";
    const activeLinkStyle = "bg-blue-600 text-white font-semibold dark:bg-blue-600 dark:text-white"; // El activo es igual en ambos modos

    return (
        // --- RESPONSIVA ---
        /*
            className es un template string (con comillas ``).
            fixed inset-y-0 left-0 z-50: En móvil, la barra ahora es fija, ocupa toda la altura y tiene un z-index alto para que se superponga al contenido.
            transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}: Si isOpen es true, la barra se posiciona en translate-x-0 (visible). Si es false, se mueve -translate-x-full (completamente fuera de la pantalla a la izquierda).
            lg:translate-x-0: En pantallas grandes, forzamos que siempre esté visible, ignorando el estado isOpen.
            transition-transform duration-300 ease-in-out: La propiedad transform debe ocurrir suavemente durante 300 milisegundos.
         */
        <aside className={`transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out`}>
            {/* Logo y Nombre de la App */}
            <div className="flex items-center space-x-2 p-4 h-16 border-b border-gray-200 dark:border-gray-800">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="text-xl font-bold text-gray-900 dark:text-white">LifeBit</span>
            </div>
            {/* Contenedor principal de la navegación que ocupa el espacio restante */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            // `NavLink` nos da `isActive` para saber si la ruta está activa.
                            className={({ isActive }) =>
                                `${linkStyle} ${isActive && activeLinkStyle}`}
                            onClick={onLinkClick}
                        >
                            {link.icon}
                            <span className="truncate">{link.text}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Enlaces de la parte inferior */}
                <div className="p-4 space-y-2">
                    {bottomLinks.map(link => (
                        // <NavLink> nos dice cuál es la URL actual.
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                // isActive: true si la URL del navegador coincide con el to del enlace.
                                `${linkStyle} ${isActive && activeLinkStyle}`}
                            onClick={onLinkClick}
                        >
                            {link.icon}
                            <span className="truncate">{link.text}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;