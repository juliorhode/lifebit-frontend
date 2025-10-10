import React from 'react';
import { useAuthStore } from '../../../store/authStore';
import { STYLES } from '../../../utils/styleConstants';

const SeccionPerfil = () => {
  const usuario = useAuthStore(state => state.usuario);
  const estado = useAuthStore(state => state.estado);

  // Estado de Carga
  if (estado === 'loading' || (estado === 'loggedIn' && !usuario)) {
    return (
      <section className="card-theme" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-primary text-xl font-semibold mb-4">
          Perfil
        </h2>
        <p className="text-secondary">Cargando información del perfil...</p>
      </section>
    );
  }

  // Estado de Error (si no hay usuario después de cargar)
  if (!usuario) {
    return (
      <section className="card-theme" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-primary text-xl font-semibold mb-4">
          Perfil
        </h2>
        <p className="text-red-500">No se pudo cargar la información del perfil.</p>
      </section>
    );
  }

  // Función para obtener colores de badge según valor
  const getBadgeClasses = (value) => {
    if (value === 'activo') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (value === 'dueño_app') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (value === 'administrador') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (value === 'residente') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Estado de Éxito (usuario logueado y disponible)
  return (
    <section className="card-theme" aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="text-primary text-xl font-semibold mb-6">
        Perfil de Usuario
      </h2>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
        <img
          key={usuario.avatar_url} // Forzamos recarga si cambia la URL
          src={usuario.avatar_url || `https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}`}
          alt={`Avatar de ${usuario.nombre}`}
          referrerPolicy="no-referrer" // Evita problemas con CORS si la URL es externa. Esto lo realiza de forma anonima y no le dice a google de donde viene.
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

      <div className="space-y-4 border-t border-theme-light pt-6 mt-6"> {/* Separador visual */}
        <h3 className="text-primary text-lg font-semibold mb-4">Detalles de la Cuenta</h3>

        {/* Campo Método de Registro */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <span className="text-secondary font-medium">Método de Registro:</span>
          {usuario.provider === 'google' ? ( // Asumiendo que 'provider' viene del backend
            <div className="flex items-center space-x-2">
              {STYLES.googleIconSVG}
              <span className="text-primary">Google</span>
            </div>
          ) : ( // Si no es Google, asumimos email/contraseña
            <span className="text-primary">Email y Contraseña</span>
          )}
        </div>

        {/* Campo Edificio */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <span className="text-secondary font-medium">Edificio:</span>
          <span className="text-primary">
            {usuario.nombre_edificio || (usuario.id_edificio_actual ? `ID: ${usuario.id_edificio_actual}` : 'No asignado')}
          </span>
        </div>

        {/* Campo Estado de Configuración (solo para administradores) */}
        {usuario.estado_configuracion && usuario.rol === 'administrador' && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <span className="text-secondary font-medium">Estado de Configuración:</span>
            <span className="text-primary">{usuario.estado_configuracion}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default SeccionPerfil;