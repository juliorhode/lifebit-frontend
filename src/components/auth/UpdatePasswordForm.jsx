import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { updatePasswordSchema } from '../../utils/validationSchemas.jsx';
import apiService from '../../services/apiService';
import Spinner from '../ui/Spinner';
import { STYLES } from '../../utils/styleConstants.jsx';
import { useAuthStore } from '../../store/authStore.js';

/**
 * Componente de formulario para que un usuario logueado actualice su contraseña.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onSuccess - Función a llamar cuando la contraseña se actualiza con éxito, pasando el mensaje de éxito.
 */
const UpdatePasswordForm = ({ onSuccess }) => {
    const [serverError, setServerError] = useState('');
    const setToken = useAuthStore((state) => state.setToken);
    const getProfile = useAuthStore((state) => state.getProfile);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(updatePasswordSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const response = await apiService.patch('/auth/update-password', {
                contraseñaActual: data.passwordActual,
                nuevaContraseña: data.password,
            });

            const { accessToken, message } = response.data;
            if (accessToken) {
                setToken(accessToken); // Actualizamos el nuevo token en el store
                await getProfile();    // Obtenemos el perfil, lo que pone el estado de vuelta en 'loggedIn'
            }

            reset(); // Limpiamos el formulario
            onSuccess(message || 'Contraseña actualizada exitosamente.'); // Notificamos al padre

        } catch (err) {
            setServerError(err.response?.data?.error?.mensaje || 'Ha ocurrido un error.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className={STYLES.label}>Contraseña Actual</label>
                <input type="password" {...register("passwordActual")} className={STYLES.input} autoFocus />
                {errors.passwordActual && <p className={STYLES.errorText}>{errors.passwordActual.message}</p>}
            </div>
            <div>
                <label className={STYLES.label}>Nueva Contraseña (mínimo 8 caracteres)</label>
                <input type="password" {...register("password")} className={STYLES.input} />
                {errors.password && <p className={STYLES.errorText}>{errors.password.message}</p>}
            </div>
            <div>
                <label className={STYLES.label}>Confirmar Nueva Contraseña</label>
                <input type="password" {...register("confirmPassword")} className={STYLES.input} />
                {errors.confirmPassword && <p className={STYLES.errorText}>{errors.confirmPassword.message}</p>}
            </div>

            {serverError && <p className={`${STYLES.errorText} text-center`}>{serverError}</p>}

            <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className={STYLES.buttonPrimary}>
                    {isSubmitting ? <Spinner /> : 'Actualizar Contraseña'}
                </button>
            </div>
        </form>
    );
};

export default UpdatePasswordForm;