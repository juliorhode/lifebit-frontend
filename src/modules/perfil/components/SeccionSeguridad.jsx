/**
 * @description Componente presentacional que gestiona las opciones de seguridad de la cuenta del usuario.
 * Utiliza el hook `useSeguridadPerfil` para obtener toda la lógica y el estado.
 *
 * @returns {JSX.Element} La sección de seguridad con lógica para vinculación de cuentas y placeholders para futuras funcionalidades.
 */
import React from 'react';
import { useSeguridadPerfil } from '../hooks/useSeguridadPerfil';
import { STYLES, ASSETS } from '../../../utils/styleConstants';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';

const SeccionSeguridad = () => {
  const {
    usuario,
    isGoogleLinked,
    isSubmitting,
    isConfirmModalOpen,
    openConfirmModal,
    closeConfirmModal,
    handleDesvincularConfirmado,
  } = useSeguridadPerfil();

  if (!usuario) {
    return (
      <section className="card-theme animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
      </section>
    );
  }

  return (
    <>
      <section className="card-theme" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-primary text-xl font-semibold mb-4">
          Seguridad de la Cuenta
        </h2>
        <div className="space-y-8"> {/* Aumentamos el espacio para separar mejor las secciones */}

          {/* --- SECCIÓN DE CUENTAS VINCULADAS --- */}
          <div>
            <h3 className="text-lg font-medium text-primary">Cuentas Vinculadas</h3>
            <p className="text-secondary mt-1 text-sm">
              {isGoogleLinked
                ? 'Tu perfil está conectado a tu cuenta de Google para un inicio de sesión rápido.'
                : 'Conecta tu cuenta de Google para un inicio de sesión más rápido y sin contraseña.'}
            </p>
            <div className="mt-4">
              {isGoogleLinked ? (
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg border border-theme-light">
                  <div className="flex items-center gap-3">
                    {ASSETS.googleIconSVG}
                    <div>
                      <p className="font-semibold text-primary">Google</p>
                      <p className="text-xs text-secondary">{usuario.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={openConfirmModal}
                    disabled={isSubmitting}
                    className="btn-secondary bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    Desvincular
                  </button>
                </div>
              ) : (
                  // Apuntamos a la ruta de autenticación de Google genérica y pública.
                  // Nuestro backend (`googleCallback`) ya sabe cómo manejar el caso de
                  // un usuario existente, resultando en una vinculación.
                  // Tras el éxito, redirigirá al Dashboard por defecto.
                <a
                  href={`/api/auth/google`}
                  className={STYLES.buttonGooglePerfil}
                >
                  {ASSETS.googleIconSVG}
                  Vincular con Google
                </a>
              )}
            </div>
          </div>

          {/* --- NUEVA SECCIÓN: CAMBIO DE CORREO ELECTRÓNICO (VISUAL) --- */}
          <div className="border-t border-theme-light pt-6">
            <h3 className="text-lg font-medium text-primary">Correo Electrónico</h3>
            <p className="text-secondary mt-1 text-sm">
              Tu correo electrónico actual es <strong className="text-primary">{usuario.email}</strong>.
            </p>
            <div className="mt-4">
              {/* 
                  El botón está visualmente deshabilitado. `opacity-50` y `cursor-not-allowed`
                  comunican claramente al usuario que esta acción no está disponible todavía.
                  El `title` explica el porqué al pasar el mouse.
                */}
              <button
                disabled
                className="btn-secondary opacity-50 cursor-not-allowed"
                title="Funcionalidad de cambio de correo en desarrollo."
              >
                Cambiar Correo Electrónico
              </button>
            </div>
          </div>

          {/* --- SECCIÓN DE CONTRASEÑA --- */}
          <div className="border-t border-theme-light pt-6">
            <h3 className="text-lg font-medium text-primary">Contraseña</h3>
            <p className="text-secondary mt-1 text-sm">
              Gestiona la contraseña de tu cuenta de LifeBit desde el menú de tu perfil en la cabecera.
            </p>
          </div>

        </div>
      </section>

      {/* --- MODAL DE CONFIRMACIÓN PARA DESVINCULAR --- */}
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
              Si continúas, tu sesión va a cerrarse y serás redirigido a la página de
              <br></br><strong> Login de LifeBit</strong>.
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
              onClick={handleDesvincularConfirmado}
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