import React from 'react';

const SeccionSeguridad = () => {
  return (
    // Usamos la clase @apply '.card-theme' que ya define fondo, borde, padding, sombra, etc.
    <section className="card-theme" aria-labelledby="security-heading">
      <h2 id="security-heading" className="text-primary text-xl font-semibold mb-4">
        Seguridad
      </h2>
      <div className="space-y-4">
        <p className="text-secondary">
          Aquí se mostrarán las opciones para cambio de contraseña y gestión de cuentas vinculadas.
        </p>
      </div>
    </section>
  );
};

export default SeccionSeguridad;
