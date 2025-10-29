// /**
//  * @description Hook especializado que gestiona toda la lógica de negocio para la sección de seguridad del perfil.
//  * Se encarga de interactuar con el estado global (`authStore`), determinar el estado de vinculación
//  * de cuentas de terceros y manejar las llamadas a la API para acciones como desvincular,
//  * incluyendo la orquestación de un modal de confirmación.
//  *
//  * @returns {object} Un objeto con el estado y los manejadores necesarios para la UI.
//  */
// import { useState, useMemo } from 'react';
// import { useAuthStore } from '../../../store/authStore';
// import apiService from '../../../services/apiService';
// import { toast } from 'react-hot-toast';

// export const useSeguridadPerfil = () => {
//     // --- ESTADO Y ACCIONES GLOBALES ---
//     // Se extraen los valores del store de Zustand de forma individual para evitar re-renders innecesarios.
//     const usuario = useAuthStore((state) => state.usuario);
//     const getProfile = useAuthStore((state) => state.getProfile);
//     const logout = useAuthStore((state) => state.logout);

//     // --- ESTADO LOCAL DEL HOOK ---
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

//     // --- DATOS DERIVADOS ---
//     // `useMemo` recalcula `isGoogleLinked` solo cuando el objeto `usuario` cambia.
//     // La lógica se basa en la existencia del `google_id`, que es nuestra fuente de verdad en la BD.
//     const isGoogleLinked = useMemo(() => !!usuario?.google_id, [usuario]);

//     // --- MANEJADORES DE MODAL ---
//     const openConfirmModal = () => setIsConfirmModalOpen(true);
//     const closeConfirmModal = () => {
//         if (!isSubmitting) {
//             setIsConfirmModalOpen(false);
//         }
//     };

//     // --- LÓGICA DE NEGOCIO ---
//     /**
//      * @description Ejecuta la acción de desvincular la cuenta de Google.
//      * Es llamada desde el modal de confirmación.
//      */
//     const handleDesvincularConfirmado = async () => {
//         setIsSubmitting(true);
//         const toastId = toast.loading('Desvinculando tu cuenta de Google...');

//         try {
//             await apiService.post('/perfil/google/desvincular');
            
//             closeConfirmModal();
            
//             // Sincronizamos el estado global para que toda la UI refleje el cambio.
//             // await getProfile();
//             setTimeout(() => {
//                 logout();
//             },1500);

//             toast.success('Cuenta de Google desvinculada exitosamente.', { id: toastId });
//         } catch (error) {
//             const errorMessage = error.response?.data?.message || 'No se pudo desvincular la cuenta.';
//             toast.error(errorMessage, { id: toastId });
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // --- API PÚBLICA DEL HOOK ---
//     return {
//         usuario,
//         isGoogleLinked,
//         isSubmitting,
//         isConfirmModalOpen,
//         openConfirmModal,
//         closeConfirmModal,
//         handleDesvincularConfirmado,
//     };
// };


// Ruta: src/modules/perfil/hooks/useSeguridadPerfil.js

/**
 * @file useSeguridadPerfil.js
 * @description Hook especializado que gestiona toda la lógica de negocio para la sección de seguridad del perfil.
 * Se encarga de interactuar con el estado global (`authStore`), determinar el estado de vinculación
 * de cuentas y manejar las llamadas a la API para acciones como desvincular.
 * **Refactorizado para implementar un "Soft Logout" que mejora la experiencia de usuario.**
 *
 * @returns {object} Un objeto con el estado y los manejadores necesarios para la UI.
 */
import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export const useSeguridadPerfil = () => {
  // --- ESTADO Y ACCIONES GLOBALES ---
  // Extraemos las funciones y datos necesarios de nuestro store de Zustand.
  // `logout` es la acción final que llamaremos.
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);

  // --- ESTADO LOCAL DEL HOOK ---
  // `isSubmitting` controla el estado de carga durante la llamada a la API.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // `isConfirmModalOpen` gestiona la visibilidad del modal de confirmación ("¿Estás seguro?").
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // `isSuccessModalOpen` gestiona la visibilidad del modal de éxito post-desvinculación.
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  

  // --- DATOS DERIVADOS ---
  // `useMemo` recalcula `isGoogleLinked` solo cuando el objeto `usuario` cambia, optimizando el rendimiento.
  const isGoogleLinked = useMemo(() => !!usuario?.google_id, [usuario]);

  // --- MANEJADORES DE MODALES ---

  // Modal de Confirmación
  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => {
    // Solo permitimos cerrar el modal si no hay una operación en curso.
    if (!isSubmitting) {
      setIsConfirmModalOpen(false);
    }
  };

  // **NUEVO**: Modal de Éxito
  const openSuccessModal = () => setIsSuccessModalOpen(true);
  // Este modal no tiene un "cancelar", por lo que su cierre siempre desencadena el logout.
  // Lo manejaremos con la función `handleFinalLogout`.

  // --- LÓGICA DE NEGOCIO ---

  /**
   * @description Ejecuta la acción de desvincular la cuenta de Google.
   * **REFACTORIZADO:** En caso de éxito, en lugar de un logout inmediato,
   * cierra el modal de confirmación y abre un modal de éxito para guiar al usuario.
   */
  const handleDesvincularConfirmado = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Desvinculando tu cuenta de Google...');

    try {
      // 1. Llamamos a la API para ejecutar la desvinculación en el backend.
      await apiService.post('/perfil/google/desvincular');
      
      // 2. Cerramos el modal de confirmación ("¿Estás seguro?").
      closeConfirmModal();
      
      // 3. Mostramos un toast de éxito inmediato para feedback rápido.
      toast.success('Cuenta de Google desvinculada exitosamente.', { id: toastId });
      
      // 4. Abrimos el nuevo modal de éxito.
      setIsSuccessModalOpen(true);

    } catch (error) {
      // En caso de error, el comportamiento no cambia.
      const errorMessage = error.response?.data?.message || 'No se pudo desvincular la cuenta.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      // Nos aseguramos de resetear el estado de `isSubmitting` en cualquier caso.
      setIsSubmitting(false);
    }
  };

  /**
   * @description **NUEVA FUNCIÓN**: Acción final que se ejecuta desde el modal de éxito.
   * Llama a la acción de logout del store, que se encargará de limpiar el estado
   * y redirigir al usuario a la página de login.
   */
  const handleFinalLogout = () => {
    logout();
  };

  // --- API PÚBLICA DEL HOOK ---
  // Exponemos los nuevos estados y manejadores para que el componente de UI pueda usarlos.
  return {
    usuario,
    isGoogleLinked,
    isSubmitting,
    // Modal de confirmación
    isConfirmModalOpen,
    openConfirmModal,
    closeConfirmModal,
    handleDesvincularConfirmado,
    // Modal de éxito
    isSuccessModalOpen,
    handleFinalLogout,
  };
};