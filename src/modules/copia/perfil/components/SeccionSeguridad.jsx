/**
 * @description Componente presentacional que gestiona las opciones de seguridad de la cuenta del usuario.
 * Utiliza el hook `useSeguridadPerfil` para obtener toda la lógica y el estado, manteniendo
 * este componente enfocado únicamente en la renderización de la interfaz.
 *
 * @returns {JSX.Element} La sección de seguridad con lógica condicional para la vinculación
 * de cuentas y un modal de confirmación para acciones destructivas.
 */
import React from 'react';
import { useSeguridadPerfil } from '../hooks/useSeguridadPerfil'; // Importamos el nuevo hook
import { STYLES, ASSETS } from '../../../utils/styleConstants';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal'; // Importamos nuestro componente Modal reutilizable

const SeccionSeguridad = () => {
  // --- LÓGICA DESACOPLADA ---
  // Obtenemos todos los datos y funciones necesarios desde nuestro hook especializado.
  // El componente ya no sabe cómo funcionan, solo los utiliza.
  const {
    usuario,
    isGoogleLinked,
    isSubmitting,
    isConfirmModalOpen,
    openConfirmModal,
    closeConfirmModal,
    handleDesvincular,
  } = useSeguridadPerfil();

  return (
    <>
      <section className="card-theme" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-primary text-xl font-semibold mb-4">
          Seguridad de la Cuenta
        </h2>
        <div className="space-y-6">
          {/* --- SECCIÓN DE CUENTAS VINCULADAS --- */}
          <div>
            <h3 className="text-lg font-medium text-primary">Cuentas Vinculadas</h3>
            <p className="text-secondary mt-1 text-sm">
              {isGoogleLinked
                ? 'Tu perfil está conectado a tu cuenta de Google.'
                : 'Conecta tu cuenta de Google para un inicio de sesión más rápido y sin contraseña.'}
            </p>
            <div className="mt-4">
              {isGoogleLinked ? (
                // --- VISTA CUANDO LA CUENTA ESTÁ VINCULADA ---
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg border border-theme-light">
                  <div className="flex items-center gap-3">
                    {STYLES.googleIconSVG}
                    <div>
                      <p className="font-semibold text-primary">Google</p>
                      <p className="text-xs text-secondary">{usuario.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={openConfirmModal} // Al hacer clic, ahora abrimos el modal de confirmación.
                    disabled={isSubmitting}
                    className="btn-secondary bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    Desvincular
                  </button>
                </div>
              ) : (
                // --- VISTA CUANDO LA CUENTA NO ESTÁ VINCULADA ---
                <a
                    href="/api/auth/google"
                    className={STYLES.buttonGooglePerfil }>
                  {ASSETS.googleIconSVG}
                  Vincular con Google
                </a>
              )}
            </div>
          </div>

          {/* --- SECCIÓN DE CONTRASEÑA (Placeholder) --- */}
          <div className="border-t border-theme-light pt-6">
            <h3 className="text-lg font-medium text-primary">Contraseña</h3>
            <p className="text-secondary mt-1 text-sm">
              Gestiona la contraseña de tu cuenta de LifeBit.
            </p>
            {/* Aquí irá el componente para cambiar la contraseña */}
          </div>
        </div>
      </section>

      {/* --- MODAL DE CONFIRMACIÓN PARA DESVINCULAR --- */}
      {/* Este modal vive aquí pero es controlado completamente por el hook. */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        title="Confirmar Desvinculación"
      >
        <div className="text-center">
          <p className="text-lg mb-4 text-secondary">
            ¿Estás seguro de que deseas desvincular tu cuenta de Google?
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm p-3 rounded-md mb-6">
            <p>
              Si continúas, ya no podrás iniciar sesión con Google. Deberás usar tu
              <strong> email y contraseña</strong> de LifeBit.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={closeConfirmModal}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDesvincular} // El botón de confirmación llama a la acción final.
              className="btn-primary bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner type="dots" /> : 'Sí, Desvincular'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SeccionSeguridad;