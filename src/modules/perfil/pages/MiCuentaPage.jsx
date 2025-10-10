import SeccionSeguridad from '../components/SeccionSeguridad';
import SeccionPerfil from '../components/SeccionPerfil'; // Importamos SeccionPerfil
import { STYLES } from '../../../utils/styleConstants';

const MiCuentaPage = () => {
  return (
    <main className="p-4 sm:p-6 lg:p-8" aria-labelledby="main-title">
      <header className="mb-6">
        <h1 id="main-title" className={STYLES.titlePage}>
          Mi Cuenta
        </h1>
        <p className="text-secondary mt-1">
          Gestiona tu información personal, seguridad y preferencias.
        </p>
      </header>
      
      <div className="space-y-8">
        <SeccionPerfil /> {/* Renderizamos SeccionPerfil aquí */}
        <SeccionSeguridad />
      </div>
    </main>
  );
};

export default MiCuentaPage;