import React, { useState, useEffect } from 'react';
// Importamos componentes de react-router-dom para la navegación
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// Importamos nuestro hook de Zustand para acceder al estado global
import { useAuthStore } from '../store/authStore';
import Modal from '../components/ui/Modal';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
// Importamos estilos reutilizables
import { STYLES } from '../utils/styleConstants';
import Logo from '../components/ui/Logo';


const LoginPage = () => {
    // Estado para controlar la visibilidad del modal
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [isFormProcessing, setFormProcessing] = useState(false);

    // --- ESTADO LOCAL ---
    // Estado local para manejar los campos del formulario.
    // Esto no necesita estar en Zustand porque solo esta página se preocupa por estos valores.
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [urlError, setUrlError] = useState(''); // Estado para el error de la URL

    // --- CONEXIÓN CON EL ESTADO GLOBAL (ZUSTAND) ---
    // Usamos el hook de nuestro store para "desestructurar" y obtener:
    // 1. Las piezas de estado que necesitamos leer: 'estado' (para saber si está cargando), 'error'
    // 2. Las acciones que necesitamos ejecutar: 'login'
    // En lugar de seleccionar un objeto nuevo en cada render,
    // seleccionamos cada pieza del estado de forma individual.
    // Esto evita el bucle de renderizado infinito.
    const login = useAuthStore((state) => state.login);
    const estado = useAuthStore((state) => state.estado);
    const authError = useAuthStore((state) => state.error);

    // --- MANEJO DE NAVEGACIÓN ---
    // Obtenemos la función 'navigate' para poder redirigir al usuario.
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- LÓGICA DE NEGOCIO DEL COMPONENTE ---
    const handleLogin = (e) => {
        // Prevenimos el comportamiento por defecto del formulario (recargar la página).
        e.preventDefault();
        setUrlError(''); // para limpiar el error de la URL
        // Llamamos a la acción 'login' de nuestro store, pasándole los datos locales.
        // El componente delega TODA la lógica de autenticación al store.
        login(email, contraseña);
    };
    const handleGoogleLoginClick = () => {
        // 1. Limpiamos cualquier error de URL anterior
        setUrlError('');
        // 2. Navegamos a la URL de autenticación del backend.
        // Usamos window.location.href para una redirección de página completa.
        window.location.href = '/api/auth/google';
    };
    useEffect(() => {
        const errorCode = searchParams.get('error'); // Obtenemos el código de error de la URL.
        // Si hay un error, mostramos un mensaje específico según el código.
        if (errorCode) {
            const errorMessages = {
                'invitation-not-found': 'Tu cuenta de Google no está asociada a ninguna invitación. Por favor, contacta al administrador.',
                'auth-failed': 'La autenticación con Google ha fallado. Por favor, inténtalo de nuevo.',
                'server-error': 'Ocurrió un error en el servidor. Por favor, inténtalo más tarde.',
            };
            setUrlError(errorMessages[errorCode] || 'Ha ocurrido un error inesperado.');
        }
    }, [searchParams]);

    // --- EFECTOS SECUNDARIOS (REACCIONES A CAMBIOS DE ESTADO) ---
    // Este hook 'useEffect' se ejecutará CADA VEZ que el valor de 'estado' cambie.
    useEffect(() => {
        if (estado === 'loggedIn') {
            // Redirigimos al usuario al dashboard.
            navigate('/dashboard');
        }
    }, [estado, navigate]); // El array [estado] le dice a useEffect que solo se active cuando 'estado' cambie.

    console.log('Estado de autenticación:', estado);
    console.log('Error de autenticación:', authError);
    console.log('Error de URL:', urlError);
    console.log(searchParams.toString());




    // --- RENDERIZADO DEL COMPONENTE (JSX) ---
    return (
        <>

            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                        <Logo />
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="mt-2 text-2xl font-bold">Inicia sesión en tu cuenta</h2>
                        <p className="text-gray-400">Acceso para Dueños, Administradores y Residentes</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-2xl">
                        {/* --- INICIO: SECCIÓN DE ERROR --- */}
                        {/* Renderizado condicional: Este div solo se mostrará si el estado es 'error' y hay un mensaje. */}

                        {/* Bloque para el error de la URL */}
                        {urlError && (
                            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                                <span className="font-semibold">Error:</span> {urlError}
                            </div>
                        )}
                        {/* Bloque existente para el error de login manual */}
                        {estado === 'error' && (
                            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                                <span className="font-semibold">Error:</span> {authError}
                            </div>
                        )}
                        {/* --- FIN: SECCIÓN DE ERROR --- */}

                        {/* Campo de Email */}
                        <div>
                            <label htmlFor="email" className={STYLES.label}>Correo Electrónico</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={STYLES.input} required disabled={estado === 'loading'} />
                        </div>
                        {/* Campo de Contraseña */}
                        <div>
                            <label htmlFor="contraseña" className={STYLES.label}>Contraseña</label>
                            <input type="password" id="contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)} className={STYLES.input} required disabled={estado === 'loading'} />
                        </div>
                        {/* Enlace para restablecer la contraseña */}
                        <div className="text-center -mt-4">
                            <button
                                type="button"
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className="text-sm text-blue-500 hover:underline focus:outline-none"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        {/* Botón de inicio de sesión */}
                        <button type="submit" disabled={estado === 'loading'} className={STYLES.buttonPrimary}>
                            {/* El texto del botón cambia según el estado. */}
                            {estado === 'loading' ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">O continúa con</span></div>
                        </div>
                        {/* Botón para iniciar sesión con Google */}
                        <button type="button" onClick={handleGoogleLoginClick} className={STYLES.buttonGoogle}>
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Iniciar sesión con Google
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 transition-colors">← Volver a la página principal</Link>
                    </div>
                </div>
            </div>
            {/* --- 5. Renderizado del Modal --- */}
            <Modal
                isProcessing={isFormProcessing}
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
                title={
                    <div className="flex flex-col items-center gap-4">
                        <Logo />
                        <span>Restablecer Contraseña</span>
                    </div>
                }
            >
                <ForgotPasswordForm onProcessingChange={setFormProcessing} />
            </Modal>
        </>
    );
};

export default LoginPage;