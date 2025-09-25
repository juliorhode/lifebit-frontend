import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * @description Un interruptor de tema (claro/oscuro).
 * Sigue una jerarquía de preferencias:
 * 1. La elección explícita del usuario guardada en localStorage.
 * 2. La preferencia de tema del sistema operativo del usuario.
 * 3. Un valor predeterminado (fallback), que establecemos en 'dark'.
 */
const ThemeToggle = () => {
    // 1. INICIALIZACIÓN INTELIGENTE DEL ESTADO
    // Usamos una función dentro de useState para que esta lógica solo se ejecute UNA VEZ, cuando el componente se monta por primera vez.
    const [theme, setTheme] = useState(() => {
        // En Vite, el código se puede ejecutar en el servidor durante el renderizado.
        // Nos aseguramos de que `window` exista (es decir, que estamos en el navegador).
        if (typeof window !== 'undefined' && window.localStorage) {

            // Paso 1: ¿Existe una preferencia guardada?
            const storedPrefs = window.localStorage.getItem('color-theme');
            if (storedPrefs) {
                return storedPrefs;
            }

            // Paso 2: ¿El sistema operativo prefiere el modo oscuro?
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) {
                return 'dark';
            }
        }

        // Paso 3: Nuestro valor por defecto
        return 'dark';
    });

    // 2. EFECTO SECUNDARIO PARA ACTUALIZAR EL DOM Y LOCALSTORAGE
    // Este hook se ejecuta cada vez que el valor de 'theme' cambia.
    useEffect(() => {
        // Aseguramos que estamos en el navegador
        if (typeof window === 'undefined') return;

        const root = window.document.body;

        // Removemos la clase 'dark' para resetear al modo light por defecto
        root.classList.remove('dark');

        // Si el tema es 'dark', añadimos la clase 'dark'
        if (theme === 'dark') {
            root.classList.add('dark');
        }

        // Guardamos la preferencia del usuario para futuras visitas
        window.localStorage.setItem('color-theme', theme);
    }, [theme]); // La dependencia [theme] asegura que se ejecute solo cuando 'theme' cambia.

    // 3. FUNCIÓN PARA CAMBIAR EL TEMA
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
            aria-label="Alternar modo claro/oscuro"
        >
            {/* Cambiamos el icono según el tema actual */}
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
    );
};

export default ThemeToggle;