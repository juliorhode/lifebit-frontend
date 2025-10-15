import SeccionSeguridad from '../components/SeccionSeguridad';
import SeccionPerfil from '../components/SeccionPerfil'; // Importamos SeccionPerfil
import { STYLES } from '../../../utils/styleConstants';

const MiCuentaPage = () => {
  return (
    <main className="p-4 sm:p-6 lg:p-8" aria-labelledby="main-title">
      <div className="space-y-8">
        <SeccionPerfil /> {/* Renderizamos SeccionPerfil aquí */}
        <SeccionSeguridad />
      </div>
    </main>
  );
};

export default MiCuentaPage;