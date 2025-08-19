import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import AuthCallbackPage from './pages/AuthCallbackPage';


// Componente placeholder para el dashboard
const DashboardPlaceholder = () => <h1 className="text-3xl font-bold text-white">Dashboard Principal</h1>;
const ContratosPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Contratos</h1>;
const ResidentesPlaceholder = () => <h1 className="text-3xl font-bold text-white">Página de Residentes</h1>;

// NOTA: Este es el punto de entrada de nuestros componentes y rutas.
// React Router DOM maneja qué página se muestra según la URL.

function App() {
  return (
    // El componente <Routes> envuelve todas nuestras rutas.
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Rutas Privadas (envueltas por el LayoutPrincipal) */}
      {/* 
        Así es como se anidan rutas. El componente LayoutPrincipal se renderizará
        y el <Outlet /> dentro de él será reemplazado por el `element` de la ruta hija
        que coincida con la URL.
      */}
      <Route path="/" element={<LayoutPrincipal />}>
        <Route path="dashboard" element={<DashboardPlaceholder />} />
        <Route path="contratos" element={<ContratosPlaceholder />} />
        <Route path="residentes" element={<ResidentesPlaceholder />} />
        {/* Aquí añadiremos el resto de rutas protegidas */}
      </Route>

    </Routes>
  );
}

export default App;