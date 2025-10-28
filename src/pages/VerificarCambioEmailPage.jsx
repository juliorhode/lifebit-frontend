/**
 * @file VerificarCambioEmailPage.jsx
 * @description Página pública que maneja la verificación final del cambio de correo.
 * Extrae el token de la URL, lo envía al backend y muestra el resultado (éxito o error) al usuario.
 * @returns {JSX.Element}
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import apiService from '../services/apiService';
import Logo from '../components/ui/Logo';
import Spinner from '../components/ui/Spinner';
import CountdownCircle from '../components/ui/CountdownCircle';
import { useAuthStore } from '../store/authStore';
import { STYLES } from '../utils/styleConstants';

// Definimos los posibles estados de la página para un manejo claro.
const ESTADOS = {
    VERIFICANDO: 'verificando',
    EXITO: 'exito',
    ERROR: 'error',
};

// Duración de la cuenta regresiva en segundos.
const REDIRECT_DURATION = 10;

const VerificarCambioEmailPage = () => {
    // --- ESTADO LOCAL ---
    // `estado` controla qué se muestra en la UI: el spinner, el mensaje de éxito o el de error.
    const [estado, setEstado] = useState(ESTADOS.VERIFICANDO);
    // `mensajeError` almacena el mensaje específico si la verificación falla.
    const [mensajeError, setMensajeError] = useState('');

    // --- HOOKS DE REACT ROUTER ---
    // `useSearchParams` nos permite leer los parámetros de la URL (ej. ?token=...).
    const [searchParams] = useSearchParams();
    // `useNavigate` nos permite redirigir al usuario programáticamente.
    const navigate = useNavigate();

    // --- ACCIONES DEL STORE ---
    // Necesitamos `logout` para limpiar cualquier sesión activa antes de redirigir al login.
    const logout = useAuthStore((state) => state.logout);

    // --- LÓGICA DE REDIRECCIÓN ---
    // `useCallback` memoriza la función para que no se recree en cada render.
    // Es una buena práctica, especialmente cuando se pasa como prop (como en `onComplete`).
    const handleRedirect = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    // Usamos useRef para prevenir que el efecto se ejecute dos veces en Strict Mode.
    const effectRan = useRef(false);

    // --- EFECTO DE VERIFICACIÓN ---
    // Este `useEffect` se ejecuta una sola vez cuando la página carga, gracias al array de dependencias vacío `[]`.
    useEffect(() => {
        // En Strict Mode, este efecto se ejecuta dos veces. Esto previene
        // que nuestra lógica de API se llame dos veces.
        if (effectRan.current === true) {
            return;
        }
        // Definimos una función `async` dentro del efecto para poder usar `await`.
        const verificarToken = async () => {
            // Extraemos el token de la URL.
            const token = searchParams.get('token');

            // Si no hay token en la URL, es un error inmediato.
            if (!token) {
                setEstado(ESTADOS.ERROR);
                setMensajeError('No se proporcionó un token de verificación. Por favor, revisa el enlace en tu correo.');
                return;
            }

            try {
                // Hacemos la llamada a la API para verificar el token.
                await apiService.post('/auth/verify-email-change', { token });

                // Si la llamada es exitosa (no lanza error), actualizamos el estado a ÉXITO.
                setEstado(ESTADOS.EXITO);

                // Limpiamos cualquier sesión que pudiera estar activa.
                // La redirección será manejada por el `CountdownCircle`.
                logout();
            } catch (error) {
                // Si la API devuelve un error, lo capturamos.
                setEstado(ESTADOS.ERROR);
                const msg = error.response?.data?.message || 'Ocurrió un error inesperado al verificar el token.';
                setMensajeError(msg);
            }
        };

        verificarToken();

        // Marcamos que el efecto ya se ha ejecutado.
        return () => {
            effectRan.current = true;
        };
    }, [searchParams, logout]); // Incluimos las dependencias que usamos dentro del efecto.

    /**
     * @description Renderiza el contenido principal de la página basado en el estado actual.
     * @returns {JSX.Element}
     */
    const renderContenido = () => {
        switch (estado) {
            case ESTADOS.VERIFICANDO:
                return (
                    <>
                        <Spinner />
                        <h2 className="text-2xl font-semibold text-primary mt-4">Verificando...</h2>
                        <p className="text-secondary mt-2">Estamos confirmando tu cambio de correo. Por favor, espera un momento.</p>
                    </>
                );
            case ESTADOS.EXITO:
                return (
                    <>
                        <FiCheckCircle className="mx-auto h-20 w-20 text-green-500" />
                        <h2 className="text-2xl font-semibold text-primary mt-4">¡Correo Verificado Exitosamente!</h2>
                        <p className="text-secondary mt-4">
                            Tu dirección de correo ha sido actualizada.
                        </p>
                        {/* 2. Integramos el CountdownCircle aquí */}
                        <div className="flex flex-col items-center mt-6 space-y-2">
                            <CountdownCircle
                                duration={REDIRECT_DURATION}
                                onComplete={handleRedirect} // Al completarse, llama a nuestra función de redirección.
                                size={80} // Usamos un tamaño más sutil.
                                strokeWidth={6}
                            />
                            <p className="text-sm text-tertiary">Redirigiendo al login...</p>
                        </div>
                    </>
                );
            case ESTADOS.ERROR:
                return (
                    <>
                        <FiXCircle className="mx-auto h-20 w-20 text-red-500" />
                        <h2 className="text-2xl font-semibold text-red-400 mt-4">Error en la Verificación</h2>
                        <p className="text-secondary mt-2 bg-red-500/45 p-4 rounded-md border border-red-500">
                            {mensajeError}
                        </p>
                        {/* En caso de error, sí mantenemos un botón para que el usuario pueda salir de aquí. */}
                        <button onClick={handleRedirect} className={STYLES.buttonStandar}>
                            Volver a Login
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        // Usamos `card-theme` para un contenedor centrado con los estilos correctos de tema claro/oscuro.
        <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4 dark">
            <div className="w-full max-w-md mx-auto">
                <div className="flex justify-center mb-8 h-16 border-b border-gray-200 dark:border-gray-800">
                    <Logo />
                </div>
                <div className="card-theme text-center">
                    {renderContenido()}
                </div>
            </div>
        </main>
    );
};

export default VerificarCambioEmailPage;