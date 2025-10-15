/**
 * @description Hook especializado que gestiona toda la lógica de negocio para la sección de seguridad del perfil.
 * Se encarga de interactuar con el estado global (`authStore`), determinar el estado de vinculación
 * de cuentas de terceros y manejar las llamadas a la API para acciones como desvincular,
 * incluyendo la orquestación de un modal de confirmación.
 *
 * @returns {object} Un objeto con el estado y los manejadores necesarios para la UI.
 */
import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useSeguridadPerfil = () => {
    // --- ESTADO Y ACCIONES GLOBALES ---
    // Se extraen los valores del store de Zustand de forma individual para evitar re-renders innecesarios.
    const usuario = useAuthStore((state) => state.usuario);
    const getProfile = useAuthStore((state) => state.getProfile);
    const logout = useAuthStore((state) => state.logout);

    // --- ESTADO LOCAL DEL HOOK ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // --- DATOS DERIVADOS ---
    // `useMemo` recalcula `isGoogleLinked` solo cuando el objeto `usuario` cambia.
    // La lógica se basa en la existencia del `google_id`, que es nuestra fuente de verdad en la BD.
    const isGoogleLinked = useMemo(() => !!usuario?.google_id, [usuario]);

    // --- MANEJADORES DE MODAL ---
    const openConfirmModal = () => setIsConfirmModalOpen(true);
    const closeConfirmModal = () => {
        if (!isSubmitting) {
            setIsConfirmModalOpen(false);
        }
    };

    // --- LÓGICA DE NEGOCIO ---
    /**
     * @description Ejecuta la acción de desvincular la cuenta de Google.
     * Es llamada desde el modal de confirmación.
     */
    const handleDesvincularConfirmado = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading('Desvinculando tu cuenta de Google...');

        try {
            await apiService.post('/perfil/google/desvincular');
            
            closeConfirmModal();
            
            // Sincronizamos el estado global para que toda la UI refleje el cambio.
            // await getProfile();
            setTimeout(() => {
                logout();
            },1500);

            toast.success('Cuenta de Google desvinculada exitosamente.', { id: toastId });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'No se pudo desvincular la cuenta.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- API PÚBLICA DEL HOOK ---
    return {
        usuario,
        isGoogleLinked,
        isSubmitting,
        isConfirmModalOpen,
        openConfirmModal,
        closeConfirmModal,
        handleDesvincularConfirmado,
    };
};