/**
* Importa las funciones principales de Vitest, nuestro corredor de pruebas.
* - describe: Agrupa pruebas relacionadas bajo un mismo bloque.
* - it: Define un caso de prueba individual.
* - expect: Permite realizar aserciones o 'expectativas' sobre los resultados.
*/
import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
* Importa utilidades de React Testing Library para interactuar con componentes.
* - render: 'Dibuja' el componente en un entorno de prueba simulado (JSDOM).
* - screen: Proporciona métodos para buscar elementos en el componente renderizado.
*/
import { render, screen } from '@testing-library/react';
/**
* Importa 'matchers' personalizados para jest-dom.
* Esto extiende `expect` con aserciones más legibles y específicas del DOM,
* como `.toBeInTheDocument()`, haciendo las pruebas más claras.
*/
import '@testing-library/jest-dom';

// ====================================================================================================
// 2. CONFIGURACIÓN DE LA SIMULACIÓN (MOCKING) DEL STORE DE ZUSTAND
// Aquí es donde le decimos a Vitest que, cuando 'SeccionPerfil' intente usar 'useAuthStore',
// no use el store real de la aplicación, sino una versión "falsa" que nosotros controlamos.
// Esto es crucial para que nuestras pruebas sean rápidas, aisladas y predecibles.
// ====================================================================================================

// 'vi.mock()' le dice a Vitest: "Oye, cuando alguien intente importar este módulo,
// no le des el módulo real. Yo te diré qué darle en su lugar."
// La ruta debe ser EXACTAMENTE la misma que usa el componente 'SeccionPerfil' para importar 'useAuthStore'.
import { create } from 'zustand';
import { useAuthStore } from '../../../../store/authStore';
vi.mock('../../../../store/authStore');

// Creamos un "store falso" (mockAuthStore) usando la función 'create' de Zustand.
// Este store falso tendrá el estado que nosotros queramos para cada prueba.
// Por defecto, lo inicializamos con un usuario nulo y un estado de 'loading'.
// Esto simula el escenario inicial de nuestra aplicación.
const mockAuthStore = create(() => ({
  usuario: null,    // No hay usuario logueado
  estado: 'loading' // La aplicación está cargando o verificando la sesión
}));

// 'beforeEach' es una función que se ejecuta ANTES de CADA prueba ('it') dentro de este 'describe'.
// Su propósito es "resetear" el estado de nuestra simulación para que cada prueba empiece limpia.
beforeEach(() => {
  // Aquí es donde "engañamos" al componente 'SeccionPerfil'.
  // Le decimos a 'useAuthStore' (la versión simulada) que, cuando el componente lo llame,
  // debe comportarse como si el store real tuviera el estado de nuestro 'mockAuthStore'.
  //
  // 'selector' es la función que el componente 'SeccionPerfil' le pasa a 'useAuthStore'
  // para obtener partes específicas del estado (ej. 'state => state.usuario').
  //
  // 'mockAuthStore.getState()' nos da el estado actual de nuestro store falso.
  //
  // Al llamar 'selector(mockAuthStore.getState())', estamos simulando el comportamiento
  // exacto del hook 'useAuthStore' real, pero con nuestro estado controlado.
  useAuthStore.mockImplementation((selector) => selector(mockAuthStore.getState()));
});

// Importamos el componente que vamos a probar.
import SeccionPerfil from '../SeccionPerfil';

// ====================================================================================================
// 3. DEFINICIÓN DE LAS PRUEBAS PARA 'SeccionPerfil'
// Aquí agrupamos todas las pruebas relacionadas con el componente 'SeccionPerfil'.
// ====================================================================================================

// 'describe' es el bloque principal para nuestras pruebas de 'SeccionPerfil'.
describe('SeccionPerfil', () => {

  // --- PRUEBA 1: ESTADO DE CARGA ---
  // Esta prueba verifica que el componente muestra un mensaje de carga
  // cuando el usuario aún no ha sido cargado (estado 'loading').
  // El it('...') describe el objetivo de la prueba.
  // Es lo que aparecerá en el reporte de Vitest cuando ejecutes npm test
  it('debe mostrar un estado de carga si el usuario es null y el estado es loading', () => {
    // ARRANGE (Preparar):
    // En este caso, ya hemos configurado nuestro 'mockAuthStore' en el 'beforeEach'
    // para que tenga 'usuario: null' y 'estado: 'loading''.
    // No necesitamos hacer nada más aquí para este escenario.

    // ACT (Actuar):
    // Renderizamos el componente 'SeccionPerfil' en nuestro entorno de prueba.
    // Esto "dibuja" el componente como si estuviera en el navegador.
    render(<SeccionPerfil />);

    // ASSERT (Afirmar):
    // Usamos 'screen.getByText()' para buscar un elemento en la pantalla
    // que contenga el texto "Cargando información del perfil...".
    // La 'i' al final de la expresión regular '/Cargando.../i' significa
    // que la búsqueda no distinguirá entre mayúsculas y minúsculas.
    //
    // '.toBeInTheDocument()' es un "matcher" de '@testing-library/jest-dom'
    // que verifica si el elemento encontrado está presente en el DOM simulado.
    // Si lo encuentra, la prueba PASA. Si no, la prueba FALLA.
    expect(screen.getByText(/Cargando información del perfil.../i)).toBeInTheDocument();
  });

  // --- PRUEBA 2: ESTADO DE USUARIO LOGUEADO ---
  it('debe mostrar el nombre, email, avatar y badges del usuario cuando está logueado', () => {
    // ARRANGE (Preparar):
    mockAuthStore.setState({
      usuario: {
        id: 1,
        nombre: 'Julio',
        apellido: 'Rhode',
        email: 'juliorhode@gmail.com',
        estado: 'activo',
        rol: 'dueño_app',
        avatar_url: 'https://example.com/avatar.jpg',
        id_edificio_actual: null,
        nombre_edificio: null,
        estado_configuracion: null,
        provider: 'google'
      },
      estado: 'loggedIn'
    });
    // ACT (Actuar):
    render(<SeccionPerfil />);
    // ASSERT (afirmar):
    expect(screen.getByText(/Julio Rhode/i)).toBeInTheDocument();
    expect(screen.getByText(/juliorhode@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Avatar de Julio/i })).toBeInTheDocument();
    // Verificar badges
    expect(screen.getByText('Dueño de la App')).toBeInTheDocument();
    expect(screen.getByText('activo')).toBeInTheDocument();
    // Verificar detalles
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('No asignado')).toBeInTheDocument();
  });

  // --- PRUEBA 3: ESTADO DE ERROR (PENDIENTE DE IMPLEMENTAR) ---
  // Aquí añadiríamos una prueba para cuando hay un error al cargar el perfil.
  // Esta prueba verifica que el componente muestra un mensaje de error
  // cuando el estado del store es 'error' y no hay usuario.
  it('debe mostrar un mensaje de error si no se pudo cargar el perfil', () => {
    // ARRANGE (Preparar):
    // Actualizamos el estado de nuestro 'mockAuthStore' para simular que ha ocurrido un error al cargar el perfil.
    mockAuthStore.setState({
      usuario: null, // No hay usuario cargado
      estado: 'error' // Estado de error
    });
    // ACT (Actuar):
    // Renderizamos el componente 'SeccionPerfil' con el estado simulado.
    render(<SeccionPerfil />);
    // ASSERT (Afirmar):
    // Verificamos que el mensaje de error se muestra en la pantalla.
    expect(screen.getByText(/No se pudo cargar la información del perfil./i)).toBeInTheDocument();
  });

});