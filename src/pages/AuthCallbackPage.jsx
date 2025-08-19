import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * @description Página de "callback" que se encarga de finalizar el
 * proceso de autenticación de OAuth (ej. Google). Es una página funcional
 * que el usuario apenas debería ver.
 */
const AuthCallbackPage = () => {
    // Hooks de React Router para leer la URL y para navegar
    const location = useLocation();
    const navigate = useNavigate();

    // Acciones de nuestro store de Zustand
    const setToken = useAuthStore((state) => state.setToken);
    const getProfile = useAuthStore((state) => state.getProfile);

    // useEffect con [] se ejecuta solo una vez, al montar el componente
    useEffect(() => {
        // Creamos un objeto para manejar los parámetros de la URL fácilmente
        const params = new URLSearchParams(location.search);
        const token = params.get('token'); // Buscamos el parámetro 'token'

        const handleAuth = async () => {
            if (token) {
                // 1. Guardamos el token en nuestro estado global
                setToken(token);
                // 2. Usamos el token guardado para pedir el perfil del usuario
                await getProfile();
                // 3. Redirigimos al dashboard
                navigate('/dashboard');
            } else {
                // Si no hay token, algo salió mal. Redirigimos al login con un error.
                // TODO: Pasar el mensaje de error al LoginPage.
                navigate('/login');
            }
        };

        handleAuth();
    }, [location, navigate, setToken, getProfile]);

    // Mientras la lógica se ejecuta, mostramos un mensaje de carga.
    // El usuario apenas debería ver esto por más de un segundo.
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-950">
            <div className="text-center">
                <p className="text-2xl font-semibold text-white">Autenticando...</p>
                <p className="mt-2 text-gray-400">Por favor, espera un momento.</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;