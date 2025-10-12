import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { STYLES } from '../../../utils/styleConstants';
import { usePerfilForm } from '../hooks/usePerfilForm'; 

const SeccionPerfil = () => {
  const usuario = useAuthStore(state => state.usuario);
  const estado = useAuthStore(state => state.estado);
 // Estado local para controlar si estamos en modo "vista" o "edición".
  const [isEditing, setIsEditing] = useState(false);

    // --- HOOK DE FORMULARIO ---
    // Instanciamos nuestro hook, pasándole el usuario actual y un callback para cuando la actualización sea exitosa.
    const {
      register,
      handleSubmit,
      errors,
      isSubmitting,
      isDirty,
      cancelarEdicion,
    } = usePerfilForm(usuario, () => {
      // Este callback se ejecuta cuando `onUpdateSuccess` es llamado desde el hook.
      // Simplemente, volvemos al modo de vista.
      setIsEditing(false);
    });
  
    // --- MANEJADORES DE EVENTOS ---
    const handleCancel = () => {
      cancelarEdicion(); // Llama a la función del hook para revertir los cambios en el formulario.
      setIsEditing(false); // Vuelve al modo de vista.
    };
  
  // --- RENDERIZADO CONDICIONAL ---

  // Estado de Carga: Muestra un esqueleto mientras se obtiene la información.
  if (estado === 'loading' || !usuario) {
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

  console.log(usuario.rol);
  // Función para obtener colores de badge según valor
  const getBadgeClasses = (value) => {
    console.log(value);
    
    
    
    if (value === 'activo') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (value === 'dueño_app') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (value === 'administrador') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (value === 'residente') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  /// --- RENDERIZADO PRINCIPAL ---
    return (
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
  
        <div className="border-t border-theme-light pt-6 mt-6">
          {/* 
            RENDERIZADO CONDICIONAL:
            - Si `isEditing` es true, mostramos el formulario.
            - Si `isEditing` es false, mostramos la vista de solo lectura.
          */}
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
  
              {/* Botones de acción del formulario */}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
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
    );
};

export default SeccionPerfil;