# Análisis de Arquitectura del Frontend - LifeBit

Este documento detalla la estructura, flujo y tecnologías del proyecto frontend de LifeBit, basado en un análisis estático de los archivos clave.

## 1. Análisis General

El proyecto está construido sobre una base tecnológica moderna y robusta, siguiendo las mejores prácticas de la industria para aplicaciones de React.

### Tecnologías Principales:
*   **Framework:** React 19 con Vite.
*   **Enrutamiento:** `react-router-dom 7` (SPA).
*   **Manejo de Estado:** Zustand 5.
*   **Llamadas API:** Axios.
*   **Formularios:** `react-hook-form` con `yup`.
*   **UI y Estilos:** `tailwindcss 4`, `headlessui`, `lucide-react`.
*   **Notificaciones:** `react-hot-toast`.

### Estructura y Flujo:
1.  **Punto de Entrada (`src/main.jsx`):** Inicializa React y envuelve la aplicación en `<BrowserRouter>`.
2.  **Componente Raíz (`src/App.jsx`):** Es el centro de control que:
    *   **Verifica la Sesión:** A través del componente `<SessionVerifier>`, que debe orquestar la llamada inicial para comprobar si existe una sesión de usuario válida.
    *   **Define Rutas:** Utiliza `<Routes>` para mapear las URLs a los componentes correspondientes.
    *   **Distingue Rutas Públicas y Privadas:** Las rutas como `/login` son públicas. Las rutas bajo `/dashboard` están protegidas por el componente `<RutaProtegida />`, que actúa como un guardián de autenticación.
3.  **Layout Persistente (`src/components/layout/LayoutPrincipal.jsx`):** Una vez autenticado, el usuario ve una interfaz consistente (con Sidebar y Header) gracias a este componente que envuelve a todas las páginas del dashboard.
4.  **Autorización por Rol (`src/pages/DashboardRouter.jsx`):** Este componente es un excelente ejemplo de RBAC (Role-Based Access Control). Lee el rol del usuario desde `authStore` y renderiza el dashboard apropiado (`AdminDashboard`, `ResidenteDashboard`, etc.).
5.  **Modularidad (`src/modules`):** La organización del código en módulos por funcionalidad (`recursos`, `residentes`) es una decisión arquitectónica sobresaliente que favorece la escalabilidad y el mantenimiento a largo plazo.

## 2. Diagrama de Arquitectura

A continuación, se presenta un diagrama que visualiza las relaciones entre los componentes clave de la aplicación.

```mermaid
graph TD
    subgraph "EntryPoint: main.jsx"
        A[/"<BrowserRouter>"\]
    end

    subgraph "App Root: App.jsx"
        B(/"<SessionVerifier>"\) -- Invoca --> G
        B --> C{/"<Routes>"\}
    end

    subgraph "Estado Global (Zustand) y API"
        G[authStore <br/> status, user, accessToken]
        H[apiService <br/> Interceptores]
        G -- Acciones --> H
    end

    subgraph "Flujo de Rutas Públicas"
        C -- path="/login" --> D[LoginPage]
        D -- OnSubmit --> G
    end

    subgraph "Flujo de Rutas Protegidas"
        C -- path="/dashboard/*" --> E[/"<RutaProtegida>"\]
        E -- Autenticado? --> F[/"<LayoutPrincipal>"\]
        E -- No Autenticado? --> D

        subgraph "Layout Autenticado"
            F -- Contiene --> F_Header[Header]
            F -- Contiene --> F_Sidebar[Sidebar]
            F -- Contiene --> F_Outlet[/"<Outlet>"\]
        end
        
        F_Outlet -- Renderiza la ruta hija --> I{DashboardRouter}
        F_Outlet -- Renderiza la ruta hija --> J[RecursosPage]
        F_Outlet -- Renderiza la ruta hija --> K[ResidentesPage]
    end
    
    subgraph "Autorización (RBAC)"
        I -- Lee rol de --> G
        I -- Rol: admin --> L[AdminDashboard]
        I -- Rol: residente --> M[ResidenteDashboard]
    end

    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#f96,stroke:#333,stroke-width:2px
    style I fill:#f96,stroke:#333,stroke-width:2px
```
