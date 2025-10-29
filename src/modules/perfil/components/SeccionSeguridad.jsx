/**
 * @file SeccionSeguridad.jsx
 * @description Componente presentacional para las opciones de seguridad de la cuenta.
 * **Refactorizado para implementar el flujo de "Soft Logout"** al desvincular Google,
 * añadiendo un modal de éxito informativo para mejorar la experiencia del usuario.
 * @returns {JSX.Element}
 */
import React, { useState } from 'react';
import { useSeguridadPerfil } from '../hooks/useSeguridadPerfil';
import { FiCheckCircle } from 'react-icons/fi';
import { STYLES, ASSETS } from '../../../utils/styleConstants';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
import CambiarEmailModal from './CambiarEmailModal';

const SeccionSeguridad = () => {
  // --- CONSUMO DE HOOKS ---
  // `useSeguridadPerfil` nos da la lógica para la vinculación con Google.
  const {
    usuario,
    isGoogleLinked,
    isSubmitting,
    isConfirmModalOpen,
    openConfirmModal,
    closeConfirmModal,
    handleDesvincularConfirmado,
    isSuccessModalOpen, //controlarán el flujo de "Soft Logout
    handleFinalLogout, // controlarán el flujo de "Soft Logout
  } = useSeguridadPerfil();

  // --- ESTADO LOCAL ---
  // Este estado simple controla si el `CambiarEmailModal` debe mostrarse o no.
  // Es la única pieza de lógica que `SeccionSeguridad` necesita manejar para este flujo.
  const [isCambiarEmailModalOpen, setCambiarEmailModalOpen] = useState(false);

  // --- RENDERIZADO DE CARGA ---
  // Si la información del usuario aún no ha llegado, mostramos un esqueleto (skeleton)
  // para mejorar la percepción de rendimiento y evitar parpadeos en la UI.
  if (!usuario) {
    return (
      <section className="card-theme animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
      </section>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    // React Fragments `<>` nos permiten devolver múltiples elementos sin añadir un nodo extra al DOM.
    <>
      <section className="card-theme" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-primary text-xl font-semibold mb-4">
          Seguridad de la Cuenta
        </h2>
        <div className="space-y-8"> {/* Aumentamos el espacio para separar mejor las secciones */}

          {/* Sub-sección para Cuentas Vinculadas (Google) */}
          <div>
            <h3 className="text-lg font-medium text-primary">Cuentas Vinculadas</h3>
            <p className="text-secondary mt-1 text-sm">
              {isGoogleLinked
                ? 'Tu perfil está conectado a tu cuenta de Google para un inicio de sesión rápido.'
                : 'Conecta tu cuenta de Google para un inicio de sesión más rápido y sin contraseña.'}
            </p>
            <div className="mt-4">
              {isGoogleLinked ? (
                // Si está vinculado, mostramos la información y el botón de desvincular.
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

          {/* Sub-sección para el Cambio de Correo Electrónico */}
          <div className="border-t border-theme-light pt-6">
            <h3 className="text-lg font-medium text-primary">Correo Electrónico</h3>
            <p className="text-secondary mt-1 text-sm">
              Tu correo electrónico actual es <strong className="text-primary">{usuario.email}</strong>.
            </p>
            <div className="mt-4">
              {/* Este es el botón que activa nuestro nuevo flujo.
                  Al hacer clic, simplemente cambia el estado local `isCambiarEmailModalOpen` a `true`,
                  lo que causará que el `CambiarEmailModal` se renderice. */}
              <button
                className={STYLES.buttonGooglePerfil}
                title="Funcionalidad de cambio de correo en desarrollo."
                onClick={() => setCambiarEmailModalOpen(true)}
              >
                Cambiar Correo Electrónico
              </button>
            </div>
          </div>

          {/* Sub-sección de Contraseña */}
          <div className="border-t border-theme-light pt-6">
            <h3 className="text-lg font-medium text-primary">Contraseña</h3>
            <p className="text-secondary mt-1 text-sm">
              Gestiona la contraseña de tu cuenta de LifeBit desde el menú de tu perfil en la cabecera.
            </p>
          </div>

        </div>
      </section>

      {/* --- ZONA DE RENDERIZADO DE MODALES --- */}
      {/* Mantenemos todos los modales al final del componente para mayor claridad.
          No se renderizan en el DOM a menos que su prop `isOpen` sea `true`. */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        title="Confirmar Desvinculación"
      >
        {/* El contenido de este modal está directamente aquí porque es simple y no se reutiliza. */}
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
              {isSubmitting ? <Spinner /> : 'Sí, Desvincular'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para el cambio de correo.
          Su visibilidad está ligada a nuestro estado `isCambiarEmailModalOpen`.
          La función `onClose` simplemente actualiza ese estado a `false`. */}
      <CambiarEmailModal
        isOpen={isCambiarEmailModalOpen}
        onClose={() => setCambiarEmailModalOpen(false)}
      />

      {/**
       * @description Modal de Éxito Post-Desvinculación ("Soft Logout").
       * Su visibilidad está controlada por `isSuccessModalOpen` del hook.
       * Su única acción es llamar a `handleFinalLogout` para completar el proceso.
       */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleFinalLogout} // El cierre del modal (por 'X' o fondo) también ejecuta el logout.
        title="Desvinculación Exitosa"
      >
        <div className="text-center">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <p className="text-lg text-secondary mb-6">
            Tu cuenta de Google ha sido desvinculada correctamente.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm p-3 rounded-md mb-8">
            <p className="font-semibold">Siguiente Paso</p>
            <p className="mt-1">
              Por razones de seguridad, tu sesión actual debe reiniciarse. Serás redirigido a la página de inicio de sesión.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleFinalLogout}
              className="btn-primary w-full sm:w-auto"
            >
              Entendido, ir a Login
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SeccionSeguridad;