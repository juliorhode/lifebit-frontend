import React, { useState, useEffect } from 'react';
// Importamos componentes de react-router-dom para la navegación
import { Link, useNavigate } from 'react-router-dom';
// Importamos nuestro hook de Zustand para acceder al estado global
import { useAuthStore } from '../store/authStore';


const LoginPage = () => {

    // --- ESTADO LOCAL ---
    // Estado local para manejar los campos del formulario.
    // Esto no necesita estar en Zustand porque solo esta página se preocupa por estos valores.
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');

    // --- CONEXIÓN CON EL ESTADO GLOBAL (ZUSTAND) ---
    // Usamos el hook de nuestro store para "desestructurar" y obtener:
    // 1. Las piezas de estado que necesitamos leer: 'estado' (para saber si está cargando), 'error'
    // 2. Las acciones que necesitamos ejecutar: 'login'
    // En lugar de seleccionar un objeto nuevo en cada render,
    // seleccionamos cada pieza del estado de forma individual.
    // Esto evita el bucle de renderizado infinito.
    const login = useAuthStore((state) => state.login);
    const estado = useAuthStore((state) => state.estado);
    const error = useAuthStore((state) => state.error);

    // --- MANEJO DE NAVEGACIÓN ---
    // Obtenemos la función 'navigate' para poder redirigir al usuario.
    const navigate = useNavigate();

    // --- LÓGICA DE NEGOCIO DEL COMPONENTE ---
    const handleLogin = (e) => {
        // Prevenimos el comportamiento por defecto del formulario (recargar la página).
        e.preventDefault();
        // Llamamos a la acción 'login' de nuestro store, pasándole los datos locales.
        // El componente delega TODA la lógica de autenticación al store.
        login(email, contraseña);
    };
    // --- EFECTOS SECUNDARIOS (REACCIONES A CAMBIOS DE ESTADO) ---
    // Este hook 'useEffect' se ejecutará CADA VEZ que el valor de 'estado' cambie.
    useEffect(() => {
        if (estado === 'loggedIn') {
            // Redirigimos al usuario al dashboard.
            navigate('/dashboard');
        }
    }, [estado]); // El array [estado] le dice a useEffect que solo se active cuando 'estado' cambie.

    // --- DEFINICIONES DE ESTILO (TAILWIND CSS) ---
    const inputStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white";
    const labelStyle = "block text-left text-sm font-semibold mb-2 text-gray-300";

    // --- RENDERIZADO DEL COMPONENTE (JSX) ---
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-blue-500 hover:text-blue-400 transition-colors">LifeBit</Link>
                    <h2 className="mt-2 text-2xl font-bold">Inicia sesión en tu cuenta</h2>
                    <p className="text-gray-400">Acceso para Dueños, Administradores y Residentes</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-2xl">
                    {/* --- INICIO: SECCIÓN DE ERROR --- */}
                    {/* Renderizado condicional: Este div solo se mostrará si el estado es 'error' y hay un mensaje. */}
                    {estado === 'error' && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                            <span className="font-semibold">Error:</span> {error}
                        </div>
                    )}
                    {/* --- FIN: SECCIÓN DE ERROR --- */}
                    <div>
                        <label htmlFor="email" className={labelStyle}>Correo Electrónico</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required disabled={estado === 'loading'} />
                    </div>
                    <div>
                        <label htmlFor="contraseña" className={labelStyle}>Contraseña</label>
                        <input type="password" id="contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)} className={inputStyle} required disabled={estado === 'loading'} />
                    </div>
                    <button type="submit" disabled={estado === 'loading'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                        {/* El texto del botón cambia según el estado. */}
                        {estado === 'loading' ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600" /></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">O continúa con</span></div>
                    </div>
                    <a href="/api/auth/google" className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        Iniciar sesión con Google
                    </a>
                </form>
                <div className="text-center mt-6">
                    <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 transition-colors">← Volver a la página principal</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;