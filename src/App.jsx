import { Routes, Route, Navigate } from 'react-router-dom';
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
import MiCuentaPage from './modules/perfil/pages/MiCuentaPage';
import ResidentesPage from './modules/residentes/pages/ResidentesPage';
import AccesoDenegadoPage from './pages/AccesoDenegadoPage';


// Componente placeholder para el dashboard
const ContratosPlaceholder = () => <h1 className="text-3xl font-bold text-gray-700 dark:text-white">Página de Contratos</h1>;
const AyudaPlaceholder = () => <h1 className="text-3xl font-bold text-gray-700 dark:text-white">Página de Ayuda</h1>;


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


      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/finalizar-registro" element={<FinalizarRegistroPage />} />

        {/* --- Rutas Protegidas --- */}
        {/* Un único guardia de autenticación envuelve todo lo que requiere login */}
        <Route element={<RutaProtegida />}>

          {/* GRUPO DE RUTAS PRINCIPALES DEL DASHBOARD */}
          <Route path="/dashboard" element={<LayoutPrincipal />}>
            <Route index element={<DashboardRouter />} />

            {/* Grupo Administrador */}
            <Route element={<RutaProtegida rolesPermitidos={['administrador']} />}>
              <Route path="residentes" element={<ResidentesPage />} />
              <Route path="recursos" element={<RecursosPage />} />
              <Route path="setup" element={<SetupWizard />} />
            </Route>

            {/* Grupo Dueño */}
            <Route element={<RutaProtegida rolesPermitidos={['dueño_app']} />}>
              <Route path="contratos" element={<ContratosPlaceholder />} />
            </Route>

            {/* Rutas Comunes */}
            <Route path="mi-cuenta" element={<MiCuentaPage />} />
            <Route path="ayuda" element={<AyudaPlaceholder />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 
            RUTA DE ACCESO DENEGADO:
            La sacamos del anidamiento de `/dashboard` y le damos su propia ruta.
            Sigue estando protegida por el guardia de autenticación padre, 
            pero ahora renderizará su propio layout (el fondo oscuro),
            en lugar de intentar meterse dentro del `<Outlet />` del dashboard.
          */}
          <Route path="/acceso-denegado" element={<AccesoDenegadoPage />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionVerifier>
  );
}
// He reestructurado las rutas del dashboard para que sean hijas de /dashboard
// y estén envueltas por LayoutPrincipal, que a su vez está protegido.
// Esto es más semántico. Para acceder a contratos, la URL será /dashboard/contratos.
export default App;