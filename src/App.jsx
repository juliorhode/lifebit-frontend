import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import AuthCallbackPage from './pages/AuthCallbackPage';
import RutaProtegida from './components/RutaProtegida';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FinalizarRegistroPage from './pages/FinalizarRegistroPage';
import SessionVerifier from './components/SessionVerifier';
import DashboardRouter from './pages/DashboardRouter';
import SetupWizard from './pages/admin/setup/SetupWizard';
import { Toaster } from 'react-hot-toast';
import RecursosPage from './modules/recursos/pages/RecursosPage';
import ResidentesPage from './modules/residentes/pages/ResidentesPage';

// Componente placeholder para el dashboard
const DashboardPlaceholder = () => <h1 className="text-3xl font-bold text-white">Dashboard Principal</h1>;
const ContratosPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Contratos</h1>;
const MiCuentaPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Mi Cuenta</h1>;
const AyudaPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Ayuda</h1>;
const AdminMainDashboard = () => <h1 className="text-3xl font-bold text-white">Dashboard Principal del Administrador</h1>;

// NOTA: Este es el punto de entrada de nuestros componentes y rutas.
// React Router DOM maneja qué página se muestra según la URL.

function App() {
  return (
    <SessionVerifier>

      {/* --- COMPONENTE TOASTER --- */}
      {/* 
        Este componente es invisible por defecto. Actúa como un "portal"
        que renderizará las notificaciones toast en la parte superior de la pantalla,
        por encima de todo lo demás.
        Lo configuramos para que coincida con nuestro tema oscuro.
      */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Definimos los estilos por defecto para todos los toasts
          className: '',
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
          },
          // Estilos específicos para los toasts de éxito
          success: {
            theme: 'dark',
            iconTheme: {
              primary: '#10B981', // Verde
              secondary: 'white',
            },
          },
          // Estilos específicos para los toasts de error
          error: {
            theme: 'dark',
            iconTheme: {
              primary: '#EF4444', // Rojo
              secondary: 'white',
            },
          },
        }}
      />


      {/* El componente <Routes> envuelve todas nuestras rutas. */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/finalizar-registro" element={<FinalizarRegistroPage />} />

        {/* Grupo de Rutas Protegidas */}
        <Route element={<RutaProtegida />}>
          {/* 
        Así es como se anidan rutas. El componente LayoutPrincipal se renderizará
        y el <Outlet /> dentro de él será reemplazado por el `element` de la ruta hija
        que coincida con la URL.
        */}
          <Route path="/dashboard" element={<LayoutPrincipal />}>
            {/* 
            La ruta "index" es la que se muestra por defecto cuando se accede al path del padre.
            En este caso, cuando navegues a /dashboard, se mostrará DashboardPlaceholder.
            */}
            <Route index element={<DashboardRouter />} />
            <Route path="setup" element={<SetupWizard />} />

            <Route path="contratos" element={<ContratosPlaceholder />} />
            <Route path="residentes" element={<ResidentesPage />} />
            <Route path="mi-cuenta" element={<MiCuentaPlaceholder />} />
            <Route path="ayuda" element={<AyudaPlaceholder />} />
            <Route path="recursos" element={<RecursosPage />} />
            {/* Aquí añadiremos el resto de rutas protegidas */}
          </Route>
        </Route>
      </Routes>
    </SessionVerifier>
  );
}
// He reestructurado las rutas del dashboard para que sean hijas de /dashboard
// y estén envueltas por LayoutPrincipal, que a su vez está protegido.
// Esto es más semántico. Para acceder a contratos, la URL será /dashboard/contratos.
export default App;