import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * @description Componente principal del layout de la aplicación autenticada.
 * Organiza la estructura visual con una barra lateral (Sidebar), una cabecera (Header)
 * y un área de contenido principal donde se renderizarán las páginas.
 * 
 * @returns {JSX.Element} El layout completo de la aplicación.
 */
const LayoutPrincipal = () => {
  // 1. Asignamos el estado inicial en false. Este es el interruptor.
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 2. Esta es la función que le pasaremos al Header.
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-300">
      {/* 3. Le pasamos el estado `isOpen` a la Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onLinkClick={toggleSidebar} />

      {/* Contenedor principal que se expande para llenar el espacio restante */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* 4. Le pasamos la función `onMenuClick` al Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* 
          Área de contenido principal. El componente <Outlet> de react-router-dom
          es el marcador de posición donde se renderizarán las rutas hijas.
          Por ejemplo, el DashboardPage, la página de Contratos, etc.
        */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
      {/* Overlay para móvil: se muestra cuando el menú está abierto */}
      {isSidebarOpen && (
        // Cierra el menú si se hace clic fuera del área de la barra lateral.
        // Este div cubre toda la pantalla y tiene un fondo semitransparente.
        // La clase `lg:hidden` asegura que este overlay solo se muestre en pantallas
        // pequeñas (móviles) y no en pantallas grandes.
        // `fixed inset-0` lo posiciona para cubrir toda la pantalla.
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default LayoutPrincipal;