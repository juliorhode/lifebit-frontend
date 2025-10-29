# Roadmap Maestro del Frontend de LifeBit (v3.0)

**Leyenda de Estado:** `[x]` = Completado | `[~]` = En Progreso | `[ ]` = Pendiente

---
### Epopeya F0: La Plataforma de Lanzamiento (Fundación y Arquitectura)
*Objetivo: Forjar el esqueleto indestructible de nuestra aplicación.*

- `[x]` **F0-01 [CORE]:** Configurar Vite, estructura de carpetas, React Router.
- `[x]` **F0-02 [CORE]:** Implementar Tailwind CSS y definir el Manifiesto de Diseño (modo oscuro/claro).
- `[x]` **F0-03 [LÓGICA]:** Configurar `Zustand` para el manejo de estado global.
- `[x]` **F0-04 [LÓGICA]:** Crear el `apiService` con `axios`, incluyendo interceptores de token.
- `[x]` **F0-05 [UI/UX]:** Construir el Layout Principal adaptable (Header/Sidebar).
- `[ ]` **F0-06 [CORE]:** Configurar la librería de internacionalización (i18next) para es/en.

---
### Epopeya F1: La Puerta de Entrada (Autenticación y Vistas Públicas)
*Objetivo: Crear un flujo de acceso seguro, impecable y persistente.*

- `[x]` **F1-01 [LÓGICA]:** Construir el `authStore` con toda la lógica de estado (login, logout, refreshToken).
- `[x]` **F1-02 [CORE]:** Implementar el componente `RutaProtegida` para blindar vistas privadas.
- `[x]` **F1-03 [PÁGINA]:** Construir la `LoginPage` (formularios, lógica de estado, errores).
- `[x]` **F1-04 [PÁGINA]:** Construir la `FinalizarRegistroPage` para usuarios invitados.
- `[x]` **F1-05 [PÁGINA]:** Construir el flujo de recuperación de cuenta (`ForgotPassword` y `ResetPasswordPage`).
- `[x]` **F1-06 [PÁGINA]:** Construir la `AuthCallbackPage` para el login con Google.
- `[x]` **F1-07 [PÁGINA]:** Construir `LandingPage` y `SolicitudForm`.
- `[x]` **F1-08 [LÓGICA]:** Construir `SessionVerifier` y `useTabSync` para restaurar y sincronizar la sesión.

---
### Epopeya F2: El Centro de Comando (Panel del Dueño)
*Objetivo: Empoderarte con herramientas para dirigir tu negocio con total control.*

- `[ ]` **F2-01 [PÁGINA]:** Construir el Dashboard Principal del Dueño (Resúmenes, Notificaciones).
- `[ ]` **F2-02 [PÁGINA]:** Módulo de Gestión de Solicitudes (Listar, Aprobar/Rechazar).
- `[ ]` **F2-03 [PÁGINA]:** Módulo de Gestión de Contratos (CRUD completo).
- `[ ]` **F2-04 [PÁGINA]:** Módulo CMS para la Landing Page (con drag-and-drop).

---
### Epopeya F3: El Primer Vuelo (Onboarding del Administrador)
*Objetivo: Crear una experiencia de configuración inicial guiada y gratificante.*

- `[x]` **F3-01 [COMPONENTE]:** Construir el orquestador `SetupWizard`.
- `[x]` **F3-02 [PÁGINA]:** Paso 1: Interfaz de Creación de Unidades.
- `[x]` **F3-03 [PÁGINA]:** Paso 2: Módulo de Gestión de Recursos (CRUD de Tipos, Creación de Inventario).
- `[x]` **F3-04 [PÁGINA]:** Paso 3: Módulo de Invitación de Residentes (Individual y Masiva).

---
### Epopeya F4: La Comunidad Viva (Paneles de Admin y Residente)
*Objetivo: Construir las herramientas del día a día que hacen de LifeBit el centro de la comunidad.*

- `[ ]` **F4-01 [PÁGINA]:** Dashboard Principal del Administrador.
- `[ ]` **F4-02 [PÁGINA]:** Dashboard Principal del Residente.
- `[ ]` **F4-03 [PÁGINA]:** Módulo de Discusiones (Foro Social v1).
- `[ ]` **F4-04 [PÁGINA]:** Módulo de Elecciones v1.
- `[ ]` **F4-05 [PÁGINA]:** Sistema de Reportes/Ticketing.

---
### Epopeya F5: El Núcleo Financiero
*Objetivo: Aportar transparencia radical a las finanzas del condominio.*

- `[ ]` **F5-01 [PÁGINA]:** Módulo de Gestión de Cuentas Bancarias (Admin).
- `[ ]` **F5-02 [PÁGINA]:** Módulo de Registro de Gastos (Admin).
- `[ ]` **F5-03 [PÁGINA]:** Flujo de Reporte de Pagos (Residente y Admin).
- `[ ]` **F5-04 [PÁGINA]:** Módulo de Conciliación de Pagos (Admin).
- `[ ]` **F5-05 [PÁGINA]:** Vista de Recibos de Condominio (Residente).

---
### Epopeya F6: El Refugio del Usuario (Gestión de Perfil y Cuenta)
*Objetivo: Dar al usuario control total sobre su identidad y seguridad.*

- `[x]` **F6-01 [PÁGINA]:** Construir la página `MiCuentaPage` con `SeccionPerfil` y `SeccionSeguridad`.
- `[x]` **F6-02 [LÓGICA]:** Implementar la lógica de actualización de perfil (`usePerfilForm`).
- `[x]` **F6-03 [LÓGICA]:** Implementar el flujo completo de cambio de correo electrónico.
- `[x]` **F6-04 [LÓGICA]:** Refactorizar la UX de desvinculación de cuenta de Google. **<-- [ESTAMOS AQUÍ]**