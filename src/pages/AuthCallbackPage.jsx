import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import apiService from '../services/apiService';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Necesitamos `set` directamente para una actualización atómica.
    const set = useAuthStore(state => state.set);
    // Ya no necesitamos setToken ni getProfile por separado.

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const redirectTo = params.get('redirect_to') || '/dashboard';

            if (token) {
                try {
                    // En lugar de llamar a setToken y getProfile,
                    // vamos a establecer el token y LLAMAR DIRECTAMENTE a /perfil/me.
                    // Esto evita la condición de carrera con otros componentes.

                    // 1. Establecemos el token para que la siguiente llamada a la API funcione.
                    useAuthStore.setState({ accessToken: token, estado: 'loading' });

                    // 2. Hacemos la llamada a getProfile NOSOTROS MISMOS, aquí y ahora.
                    const response = await apiService.get('/perfil/me');
                    const usuario = response.data.data.user;

                    if (!usuario) {
                        throw new Error("No se pudo obtener el perfil del usuario.");
                    }

                    // 3. ACTUALIZACIÓN ATÓMICA FINAL:
                    // Ahora que tenemos el token Y el usuario, actualizamos el store de una sola vez.
                    useAuthStore.setState({ usuario: usuario, estado: 'loggedIn' });

                    // 4. Navegamos.
                    navigate(redirectTo, { replace: true });

                } catch (error) {
                    console.error("Error en el flujo de callback:", error);
                    useAuthStore.setState({ estado: 'loggedOut', accessToken: null, usuario: null });
                    navigate('/login?error=auth-failed', { replace: true });
                }
            } else {
                navigate('/login?error=no-token', { replace: true });
            }
        };

        handleAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <Spinner type="ring1" />
            <p className="mt-4 text-lg">Finalizando sesión...</p>
        </div>
    );
};

export default AuthCallbackPage;