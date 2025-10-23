import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiUsers, FiSettings, FiHelpCircle, FiLogOut, FiCpu } from 'react-icons/fi';
import { FaFileContract } from "react-icons/fa";
import { useAuthStore } from '../../store/authStore';
import { navLinksConfig, bottomLinksConfig } from '../../config/navigation';
import Logo from '../ui/Logo';

// NOTA: Los datos de los enlaces son estáticos por ahora para construir la UI.
// Más adelante, esta lista se generará dinámicamente según el rol del usuario.
const navLinks = [
    { to: '/dashboard', icon: <FiGrid size={20} />, text: 'Dashboard' },
    { to: '/dashboard/contratos', icon: <FaFileContract size={20} />, text: 'Contratos' },
    { to: '/dashboard/residentes', icon: <FiUsers size={20} />, text: 'Residentes' },
    { to: '/dashboard/recursos', icon: <FiCpu size={20} />, text: 'Recursos' },
];
const bottomLinks = [
    { to: '/dashboard/mi-cuenta', icon: <FiSettings size={20} />, text: 'Mi Cuenta' },
    { to: '/dashboard/ayuda', icon: <FiHelpCircle size={20} />, text: 'Ayuda' },
    { action: 'logout', icon: <FiLogOut size={20} />, text: 'Salir' },
];
/**
 * @description Componente de la barra lateral de navegación.
 * Es responsivo: se muestra de forma fija en pantallas grandes y se oculta en móviles.
 *
 * @returns {JSX.Element} La barra lateral.
 */

const Sidebar = ({ isOpen, onLinkClick }) => {
    const rolUsuario = useAuthStore((state) => state.usuario?.rol);
    // Obtenemos la acción de logout desde el store
    const logout = useAuthStore((state) => state.logout);

    // --- LÓGICA DE FILTRADO DE ENLACES ---
    // Filtramos los enlaces basándonos en si el rol del usuario está en la lista de `rolesPermitidos`.
    // Si `rolUsuario` es undefined durante la carga inicial, el filtro devolverá un array vacío,
    // y los enlaces aparecerán correctamente cuando el rol se cargue y el componente se re-renderice.
    const filteredNavLinks = navLinksConfig.filter(link =>
        rolUsuario && link.rolesPermitidos.includes(rolUsuario)
    );
    const filteredBottomLinks = bottomLinksConfig.filter(link =>
        rolUsuario && link.rolesPermitidos.includes(rolUsuario)
    );


    // --- ESTILOS ---
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
                <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                    <Logo />
                </div>
            </div>
            <div className="px-4">
                <div className="border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            {/* Contenedor principal de la navegación que ocupa el espacio restante */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/dashboard'}
                            // `NavLink` nos da `isActive` para saber si la ruta está activa.
                            className={({ isActive }) =>
                                `${linkStyle} ${isActive && activeLinkStyle}`}
                            onClick={onLinkClick}
                        >
                            {link.icon}
                            <span className="truncate">{link.text}</span>
                        </NavLink>
                    ))}
                </nav> */}

                {/* NAVEGACIÓN PRINCIPAL */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavLinks.map(link => {
                        const Icon = link.IconComponent;
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.exact}
                                className={({ isActive }) => `${linkStyle} ${isActive && activeLinkStyle}`}
                                onClick={onLinkClick}
                            >
                                <Icon size={20} />
                                <span className="truncate">{link.text}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* ---  SEPARADOR --- 
                <div className="px-4">: Creamos un contenedor exterior que tiene el mismo padding horizontal (px-4) que nuestros enlaces. Esto asegura que la línea del separador no llegue hasta los bordes de la Sidebar.
                border-t: Le dice a Tailwind que cree un borde solo en la parte superior (top) del div.
                border-gray-200: En modo claro, el borde será de un gris muy sutil.
                dark:border-gray-800: En modo oscuro, el borde será de un gris oscuro.
                */}
                <div className="px-4">
                    {/* Separador */}
                    <div className="border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                {/* Enlaces de la parte inferior (mi cuenta, ayuda, salir) */}
                {/* <div className="p-4 space-y-2">
                    {bottomLinks.map(link => {
                        // --- Renderizado condicional ---
                        // Si el elemento que estamos renderizando es el de logout, devolvemos un <button> que llama a logout en el onClick. Si no, devolvemos el <NavLink> normal.
                        if (link.action === 'logout') {
                            return (
                                <button
                                    key={link.text}
                                    onClick={logout}
                                    // Usamos 'w-full' para que ocupe todo el ancho como los NavLink
                                    className={`${linkStyle} w-full`}
                                >
                                    {link.icon}
                                    <span className="truncate">{link.text}</span>
                                </button>
                            );
                        }
                        return (
                            // <NavLink> nos dice cuál es la URL actual.
                            <NavLink
                                key={link.to}
                                to={link.to}
                                // isActive: true si la URL del navegador coincide con el to del enlace.
                                className={({ isActive }) => `${linkStyle} ${isActive && activeLinkStyle}`}
                                onClick={onLinkClick}
                            >
                                {link.icon}
                                <span className="truncate">{link.text}</span>
                            </NavLink>
                        );
                    })}
                </div> */}
                
                {/* NAVEGACIÓN SECUNDARIA */}
                <div className="p-4 space-y-2">
                    {filteredBottomLinks.map(item => {
                        const Icon = item.IconComponent;
                        if (item.type === 'action' && item.action === 'logout') {
                            return (
                                <button
                                    key={item.text}
                                    onClick={logout}
                                    className={`${linkStyle} w-full`}
                                >
                                    <Icon size={20} />
                                    <span className="truncate">{item.text}</span>
                                </button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `${linkStyle} ${isActive && activeLinkStyle}`}
                                onClick={onLinkClick}
                            >
                                <Icon size={20} />
                                <span className="truncate">{item.text}</span>
                            </NavLink>
                        );
                    })}
                </div>
                
            </div>
        </aside>
    );
};

export default Sidebar;