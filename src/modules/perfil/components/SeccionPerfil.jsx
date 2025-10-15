/**
 * @description Componente que gestiona la visualización y edición de la información del perfil del usuario.
 * Es un componente presentacional que delega toda su lógica al hook `usePerfilForm`.
 *
 * @returns {JSX.Element} La sección completa del perfil de usuario, interactiva y dinámica.
 */
import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { STYLES, ASSETS } from '../../../utils/styleConstants';
import { usePerfilForm } from '../hooks/usePerfilForm';
import { getBadgeClasses } from '../utils/perfil.utils'; // Se importa la función de utilidades.
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal'; // Se importa el Modal para la confirmación.

const SeccionPerfil = () => {
  // --- ESTADO ---
  const usuario = useAuthStore(state => state.usuario);
  const estadoAuth = useAuthStore(state => state.estado);
  const [isEditing, setIsEditing] = useState(false);

  // --- HOOK DE FORMULARIO ---
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    hayCambios, // Usamos nuestra función de detección de cambios.
    reset,
    isConfirmCancelOpen,
    openConfirmCancelModal,
    closeConfirmCancelModal,
  } = usePerfilForm(usuario, () => {
    // Callback de éxito: se ejecuta después de guardar los cambios.
    setIsEditing(false);
  });

  // --- MANEJADORES DE EVENTOS ---
  const handleCancelClick = () => {
    // Si no hay cambios, simplemente salimos del modo edición.
    if (!hayCambios) {
      setIsEditing(false);
      return;
    }
    // Si hay cambios, abrimos el modal para pedir confirmación.
    openConfirmCancelModal();
  };

  const handleConfirmCancel = () => {
    reset(); // Descarta los cambios en el formulario.
    closeConfirmCancelModal(); // Cierra el modal.
    setIsEditing(false); // Vuelve al modo de vista.
  };

  // --- RENDERIZADO CONDICIONAL ---

  // Estado de Carga: Muestra un esqueleto mientras se obtiene la información.
  if (estadoAuth === 'loading' || !usuario) {
    return (
      <section className="card-theme animate-pulse" aria-labelledby="profile-heading">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="space-y-3 flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </section>
    );
  }

  // console.log(usuario.rol);


  /// --- RENDERIZADO PRINCIPAL ---
  return (
    <>
      <section className="card-theme" aria-labelledby="profile-heading">
        <div className="flex justify-between items-center mb-6">
          <h2 id="profile-heading" className="text-primary text-xl font-semibold">
            Perfil de Usuario
          </h2>
          {/* El botón "Editar" solo se muestra si NO estamos en modo edición. */}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Editar Perfil
            </button>
          )}
        </div>

        {/* --- AVATAR Y DATOS BÁSICOS (NO CAMBIAN CON EL MODO) --- */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
          <img
            key={usuario.avatar_url}
            src={usuario.avatar_url || `https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}`}
            alt={`Avatar de ${usuario.nombre}`}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="text-center md:text-left">
            <p className="text-primary font-bold text-xl mb-1">{`${usuario.nombre} ${usuario.apellido}`}</p>
            <p className="text-secondary mb-2">{usuario.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeClasses(usuario.rol)}`}>
                {usuario.rol === 'dueño_app' ? 'Dueño de la App' : usuario.rol}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeClasses(usuario.estado)}`}>
                {usuario.estado}
              </span>
            </div>
          </div>
        </div>

        {/* 
            RENDERIZADO CONDICIONAL:
            - Si `isEditing` es true, mostramos el formulario.
            - Si `isEditing` es false, mostramos la vista de solo lectura.
          */}
        <div className="border-t border-theme-light pt-6 mt-6">
          {isEditing ? (
            // --- MODO EDICIÓN: FORMULARIO ---
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="label-theme">Nombre</label>
                  <input id="nombre" {...register('nombre')} className={`input-theme ${errors.nombre ? 'border-red-500' : ''}`} />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <label htmlFor="apellido" className="label-theme">Apellido</label>
                  <input id="apellido" {...register('apellido')} className={`input-theme ${errors.apellido ? 'border-red-500' : ''}`} />
                  {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cedula" className="label-theme">Cédula (Opcional)</label>
                  <input id="cedula" {...register('cedula')} className={`input-theme ${errors.cedula ? 'border-red-500' : ''}`} />
                  {errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula.message}</p>}
                </div>
                <div>
                  <label htmlFor="telefono" className="label-theme">Teléfono (Opcional)</label>
                  <input id="telefono" {...register('telefono')} className={`input-theme ${errors.telefono ? 'border-red-500' : ''}`} />
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleCancelClick} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !hayCambios}>
                  {isSubmitting ? <Spinner type="dots" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            // --- MODO VISTA: SOLO LECTURA ---
            <div className="space-y-4">
              <h3 className="text-primary text-lg font-semibold">Detalles Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Nombre:</span>
                  <span className="text-primary">{usuario.nombre}</span>
                </div>
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Apellido:</span>
                  <span className="text-primary">{usuario.apellido}</span>
                </div>
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Cédula:</span>
                  <span className="text-primary">{usuario.cedula || 'No especificada'}</span>
                </div>
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Teléfono:</span>
                  <span className="text-primary">{usuario.telefono || 'No especificado'}</span>
                </div>
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Correo:</span>
                  <span className="text-primary">{usuario.email || 'No especificado'}</span>
                </div>
                <div className="flex justify-between border-b border-theme-light pb-2">
                  <span className="text-secondary font-medium">Edificio:</span>
                  <span className="text-primary">{usuario.nombre_edificio || 'No especificado'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* --- MODAL DE CONFIRMACIÓN PARA CANCELAR --- */}
      <Modal
        isOpen={isConfirmCancelOpen}
        onClose={closeConfirmCancelModal}
        title="Descartar Cambios"
      >
        <div className="text-center">
          <p className="text-lg mb-6 text-secondary">
            Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={closeConfirmCancelModal}
              className="btn-secondary"
            >
              No, continuar editando
            </button>
            <button
              onClick={handleConfirmCancel}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              Sí, descartar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SeccionPerfil;