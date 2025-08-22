import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../utils/validationSchemas'; // Reutilizamos este schema
import apiService from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import Logo from '../components/ui/Logo';
import { STYLES, ASSETS } from '../utils/styleConstants';

const FinalizarRegistroPage = () => {
    const [searchParams] = useSearchParams();

    // Estados para la comunicación con la API y el estado general de la página
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState(null);

    // Efecto para leer el token de la URL una sola vez al cargar
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Token de invitación no proporcionado o inválido.');
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(resetPasswordSchema),
        mode: 'onChange', // Para validación en tiempo real
    });

    // Función para el formulario de contraseña tradicional
    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.post('/auth/finalizar-registro', {
                token: token,
                contraseña: data.password,
            });
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error?.mensaje || 'Ha ocurrido un error. El token puede ser inválido o haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    // Si la activación fue exitosa, mostramos un mensaje final
    if (success) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className={`${STYLES.card} text-center max-w-lg`}>
                    <Logo size={64} className="justify-center mb-6" />
                    <h2 className={`${STYLES.titleSection} text-green-400 mb-4`}>¡Cuenta Activada!</h2>
                    <p className="text-gray-300">{success}</p>
                    <Link to="/login" className={`${STYLES.buttonPrimary} mt-6`}>
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    // Si no hay token en la URL, mostramos un error
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className={`${STYLES.card} text-center max-w-lg`}>
                    <Logo size={64} className="justify-center mb-6" />
                    <h2 className={`${STYLES.titleSection} text-red-400 mb-4`}>Error de Activación</h2>
                    <p className="text-gray-300">{error}</p>
                    <Link to="/" className={`${STYLES.buttonLink} mt-6`}>
                        Volver a la página principal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8 flex flex-col items-center">
                    <Logo size={64} />
                    <h2 className={`${STYLES.titleSection} mt-6`}>Finaliza tu Registro en LifeBit</h2>
                    <p className="mt-2 text-gray-400">Estás a un solo paso de activar tu cuenta.</p>
                </div>
                <div className={STYLES.card}>
                    {/* --- Opción 1: Formulario Tradicional --- */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <h3 className="font-semibold text-center text-lg text-gray-200">Crea tu contraseña</h3>
                        <div>
                            <label className={STYLES.label}>Nueva Contraseña</label>
                            <input type="password" {...register("password")} className={STYLES.input} autoFocus />
                            {errors.password && <p className={STYLES.errorText}>{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className={STYLES.label}>Confirmar Contraseña</label>
                            <input type="password" {...register("confirmPassword")} className={STYLES.input} />
                            {errors.confirmPassword && <p className={STYLES.errorText}>{errors.confirmPassword.message}</p>}
                        </div>

                        {error && <p className={`${STYLES.errorText} text-center`}>{error}</p>}

                        <button type="submit" disabled={loading} className={STYLES.buttonPrimary}>
                            {loading ? <Spinner type="dots" /> : 'Activar Cuenta'}
                        </button>
                    </form>

                    {/* --- Separador --- */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700" /></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">O</span></div>
                    </div>

                    {/* --- Opción 2: Google --- */}
                    <a href={`/api/auth/google/vincular?token=${token}`} className={STYLES.buttonGoogle}>
                        {ASSETS.googleIconSVG}
                        Continuar con Google
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FinalizarRegistroPage;