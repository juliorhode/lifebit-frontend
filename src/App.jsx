import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// NOTA: Este es el punto de entrada de nuestros componentes y rutas.
// React Router DOM maneja qué página se muestra según la URL.

function App() {
  return (
    // El componente <Routes> envuelve todas nuestras rutas.
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Más adelante añadiremos aquí las rutas protegidas para el dashboard */}
    </Routes>
  );
}

export default App;