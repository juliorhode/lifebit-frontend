import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../utils/validationSchemas';
import apiService from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import { STYLES } from '../utils/styleConstants';
import Logo from '../components/ui/Logo';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estados para la comunicación con la API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState(null);

    // Efecto para leer el token de la URL una sola vez
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Token no proporcionado o inválido. Por favor, solicita un nuevo enlace.');
        }
    }, [searchParams]);

    const {
        register, // Registra los campos del formulario
        handleSubmit, // Maneja el envío del formulario
        formState: { errors }, // Extraemos los errores de validación
    } = useForm({
        resolver: yupResolver(resetPasswordSchema), // Usamos el esquema de validación definido en validationSchemas.js
        mode: 'onChange' // Valida en cada cambio para feedback instantáneo
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.patch('/auth/reset-password', {
                token: token, // El backend espera 'token'
                contraseña: data.password, // El backend espera 'contraseña'
            });
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error?.mensaje || 'Ha ocurrido un error. El token puede ser inválido o haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    // Contenido a renderizar
    let content;

    if (success) {
        content = (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-green-400 mb-4">¡Éxito!</h2>
                <p className="text-gray-300">{success}</p>
                <Link
                    to="/login"
                    className="mt-6 inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg"
                >
                    Ir a Iniciar Sesión
                </Link>
            </div>
        );
    } else if (error && !token) {
        // Muestra un error si no hay token en la URL
        content = (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                <p className="text-gray-300">{error}</p>
                <Link to="/login" className="mt-6 inline-block text-blue-500 hover:underline">
                    Volver a la página de inicio
                </Link>
            </div>
        );
    } else {
        // Muestra el formulario
        content = (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="password" className={STYLES.label}>Nueva Contraseña</label>
                    <input type="password" {...register("password")} className={STYLES.input} autoFocus />
                    {errors.password && <p className={STYLES.errorText}>{errors.password.message}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className={STYLES.label}>Confirmar Nueva Contraseña</label>
                    <input type="password" {...register("confirmPassword")} className={STYLES.input} />
                    {errors.confirmPassword && <p className={STYLES.errorText}>{errors.confirmPassword.message}</p>}
                </div>

                {error && <p className={`${STYLES.errorText} text-center`}>{error}</p>}

                <button type="submit" disabled={loading} className={STYLES.buttonPrimary}>
                    {loading ? <Spinner type="dots" /> : 'Guardar Contraseña'}
                </button>
            </form >
        );
    }


    return (
        <div className={`min-h-screen ${STYLES.backgroundPage} text-white flex items-center justify-center p-4`}>
            <div className="w-full max-w-md">
                <div className="text-center mb-">
                    <div className="flex items-center mb-4 justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                        <Logo />
                    </div>
                    <h2 className={STYLES.titleSection}>Crea tu Nueva Contraseña</h2>
                </div>
                <div className={`${STYLES.card}`}>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;