import React, { useState, useEffect } from 'react';
// Importamos componentes de react-router-dom para la navegación
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// Importamos nuestro hook de Zustand para acceder al estado global
import { useAuthStore } from '../store/authStore';
import Modal from '../components/ui/Modal';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
// Importamos estilos reutilizables
import { STYLES, ASSETS } from '../utils/styleConstants';
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
                            {ASSETS.googleIconSVG}
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