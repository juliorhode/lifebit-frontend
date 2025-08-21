import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import AuthCallbackPage from './pages/AuthCallbackPage';
import RutaProtegida from './components/RutaProtegida';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Componente placeholder para el dashboard
const DashboardPlaceholder = () => <h1 className="text-3xl font-bold text-white">Dashboard Principal</h1>;
const ContratosPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Contratos</h1>;
const ResidentesPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Residentes</h1>;
const MiCuentaPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Mi Cuenta</h1>;
const AyudaPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Ayuda</h1>;

// NOTA: Este es el punto de entrada de nuestros componentes y rutas.
// React Router DOM maneja qué página se muestra según la URL.

function App() {
  return (
    // El componente <Routes> envuelve todas nuestras rutas.
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

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
          <Route index element={<DashboardPlaceholder />} />
          <Route path="contratos" element={<ContratosPlaceholder />} />
          <Route path="residentes" element={<ResidentesPlaceholder />} />
          <Route path="mi-cuenta" element={<MiCuentaPlaceholder />} />
          <Route path="ayuda" element={<AyudaPlaceholder />} />
          {/* Aquí añadiremos el resto de rutas protegidas */}
        </Route>
      </Route>
    </Routes>
  );
}
// He reestructurado las rutas del dashboard para que sean hijas de /dashboard
// y estén envueltas por LayoutPrincipal, que a su vez está protegido.
// Esto es más semántico. Para acceder a contratos, la URL será /dashboard/contratos.
export default App;