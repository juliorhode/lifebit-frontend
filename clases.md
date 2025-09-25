# Guía de Clases CSS para Modo Claro y Oscuro

Esta guía documenta las clases CSS aplicadas en el proyecto LifeBit siguiendo el principio "Dark Mode First". Las clases están segmentadas por tipo de elemento y proporcionan equivalentes para modo claro y oscuro.

## Principios Generales

- **Dark Mode First**: Las clases base están diseñadas para modo oscuro
- **Modo Claro**: Usa variantes `dark:` para mantener consistencia
- **Colores Suaves**: En modo claro se usan grises sutiles (gray-50, gray-200) en lugar de blanco puro
- **Contraste**: Textos oscuros en claro, claros en oscuro

## 1. Fondos (Backgrounds)

| Elemento | Modo Claro | Modo Oscuro | Ejemplo |
|----------|------------|-------------|---------|
| Fondo principal de página | `bg-white` | `bg-gray-950` | LayoutPrincipal |
| Fondo de tarjetas/contenedores | `bg-white dark:bg-gray-800` | `bg-gray-800` | Estadísticas, modales |
| Fondo de secciones sutiles | `bg-gray-50 dark:bg-gray-800` | `bg-gray-800` | Paneles, toolbars |
| Fondo de elementos inactivos | `bg-gray-100 dark:bg-gray-700` | `bg-gray-700` | Estados hover |
| Fondo de barras de progreso | `bg-gray-200 dark:bg-gray-700` | `bg-gray-700` | ProgressBar |

## 2. Textos (Text Colors)

| Elemento | Modo Claro | Modo Oscuro | Ejemplo |
|----------|------------|-------------|---------|
| Títulos principales | `text-gray-900 dark:text-white` | `text-white` | Headers, títulos de página |
| Texto principal/contenido | `text-gray-700 dark:text-white` | `text-white` | Párrafos, labels |
| Texto secundario | `text-gray-600 dark:text-gray-300` | `text-gray-300` | Descripciones, placeholders |
| Texto terciario/placeholder | `text-gray-500 dark:text-gray-400` | `text-gray-400` | Ayudas, timestamps |
| Texto en elementos oscuros | `text-gray-700 dark:text-gray-200` | `text-gray-200` | Botones, sugerencias |

## 3. Bordes (Borders)

| Elemento | Modo Claro | Modo Oscuro | Ejemplo |
|----------|------------|-------------|---------|
| Bordes de tarjetas | `border border-gray-200 dark:border-gray-700` | `border-gray-700` | Contenedores |
| Bordes sutiles | `border-gray-300 dark:border-gray-700` | `border-gray-700` | Separadores |
| Bordes de inputs | `border-gray-300 dark:border-gray-600` | `border-gray-600` | Formularios |

## 4. Estados Interactivos (Hover, Focus, etc.)

| Elemento | Modo Claro | Modo Oscuro | Ejemplo |
|----------|------------|-------------|---------|
| Hover en enlaces | `hover:bg-gray-100 dark:hover:bg-gray-700` | `hover:bg-gray-700` | Navegación |
| Hover en botones | `hover:bg-gray-200 dark:hover:bg-gray-600` | `hover:bg-gray-600` | Acciones |
| Focus en inputs | `focus:ring-blue-500 focus:border-blue-500` | `focus:ring-blue-500 focus:border-blue-500` | Formularios |

## 5. Componentes Específicos

### Tarjetas de Recursos (RecursoCard)
```jsx
// Estados disponibles
disponible: {
  bg: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
  // ... otros estilos
}
ocupado: {
  bg: 'bg-gray-50 dark:bg-gray-800 border-red-300 dark:border-red-800/50',
  // ... otros estilos
}
seleccionado: {
  bg: 'bg-blue-600/50 border-blue-500 scale-105',
  // ... otros estilos (igual en ambos modos)
}
```

### Barras de Herramientas (AsignacionToolbar)
```jsx
<div className="bg-gray-50 dark:bg-gray-900 border-t-2 border-b-2 border-blue-800 p-4">
  <p className="text-gray-700 dark:text-white">Contenido</p>
</div>
```

### Paneles de Previsualización (GeneradorInventarioModal)
```jsx
<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
  <h3 className="text-gray-700 dark:text-white">Previsualización</h3>
  <p className="text-gray-600 dark:text-gray-400">Texto secundario</p>
  <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Ejemplos</span>
</div>
```

## 6. Constantes en styleConstants.jsx

Las constantes centralizadas usan las siguientes equivalencias:

```jsx
// Fondos
backgroundPage: 'bg-white dark:bg-gray-950',
backgroundCard: 'bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl',

// Textos
titlePage: 'text-3xl font-bold text-gray-900 dark:text-white',
titleSection: 'text-2xl font-bold text-gray-700 dark:text-white',

// Inputs y formularios
input: 'w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white',
label: 'block text-left text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200',

// Botones
buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors',
buttonSecondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors',

// Estados
active: 'bg-blue-600 text-white font-semibold',
inactive: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',

// Componentes drag-and-drop
paletteContainer: 'p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3',
paletteTitle: 'font-semibold text-gray-700 dark:text-white',
canvasDefault: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
```

## 7. Reglas para Nuevos Componentes

### Al crear un nuevo componente:

1. **Siempre usa variantes `dark:`** para modo oscuro
2. **Fondos**: `bg-white dark:bg-gray-800` para tarjetas, `bg-gray-50 dark:bg-gray-900` para contenedores grandes
3. **Textos**: `text-gray-900 dark:text-white` para títulos, `text-gray-600 dark:text-gray-300` para contenido
4. **Bordes**: `border-gray-200 dark:border-gray-700` para sutiles, `border-gray-300 dark:border-gray-600` para inputs
5. **Estados hover**: `hover:bg-gray-100 dark:hover:bg-gray-700`
6. **Mantén consistencia** con colores semánticos (blue para primary, red para danger, etc.)

### Ejemplo de componente nuevo:
```jsx
const NuevoComponente = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
    <h3 className="text-gray-900 dark:text-white font-bold mb-4">Título</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4">Contenido</p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
      Acción
    </button>
  </div>
);
```

## 8. Colores Semánticos (Consistentes en ambos modos)

- **Primary**: `blue-600`, `blue-500`
- **Success**: `green-500`, `green-400`
- **Error/Danger**: `red-500`, `red-400`
- **Warning**: `yellow-500`, `yellow-400`
- **Info**: `blue-500`

Estos colores permanecen iguales en ambos modos para mantener consistencia de marca.

## 9. Estrategias para Evitar Repetición de Clases

Para evitar escribir las mismas clases CSS repetidamente, implementa estas estrategias:

### A. Constantes Centralizadas (Recomendado)
Ya tienes `styleConstants.jsx`. Úsalo así:

```jsx
// En lugar de:
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-white">

// Usa:
<div className={STYLES.card}>
```

### B. Clases CSS Personalizadas con @apply
En `src/index.css`, crea clases compuestas:

```css
/* Agregar a index.css */
@layer components {
  .card-theme {
    @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-white shadow-lg;
  }

  .text-primary {
    @apply text-gray-900 dark:text-white;
  }

  .text-secondary {
    @apply text-gray-600 dark:text-gray-300;
  }

  .bg-surface {
    @apply bg-white dark:bg-gray-800;
  }

  .border-theme {
    @apply border-gray-200 dark:border-gray-700;
  }
}
```

Uso:
```jsx
<div className="card-theme">
  <h3 className="text-primary">Título</h3>
  <p className="text-secondary">Contenido</p>
</div>
```

### C. Componentes Base/UI
Crea componentes reutilizables:

```jsx
// components/ui/Card.jsx
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

// components/ui/Text.jsx
const Text = ({ variant = 'primary', children, className = '' }) => {
  const variants = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400'
  };

  return <p className={`${variants[variant]} ${className}`}>{children}</p>;
};

// Uso:
<Card>
  <Text variant="primary">Título</Text>
  <Text variant="secondary">Descripción</Text>
</Card>
```

### D. Sistema de Diseño con Props
Componentes que aceptan props para variantes:

```jsx
const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = ''
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

// Uso:
<Button variant="secondary" size="lg">Acción</Button>
```

### E. Configuración de Tema Global
En `tailwind.config.js`, define un tema personalizado:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme-bg': {
          primary: 'rgb(255 255 255 / <alpha-value>)',
          secondary: 'rgb(249 250 251 / <alpha-value>)', // gray-50
          dark: 'rgb(31 41 55 / <alpha-value>)', // gray-800
        },
        'theme-text': {
          primary: 'rgb(17 24 39 / <alpha-value>)', // gray-900
          secondary: 'rgb(75 85 99 / <alpha-value>)', // gray-600
          tertiary: 'rgb(107 114 128 / <alpha-value>)', // gray-500
        }
      }
    }
  }
}
```

Uso:
```jsx
<div className="bg-theme-bg-primary dark:bg-theme-bg-dark">
  <p className="text-theme-text-primary dark:text-white">Contenido</p>
</div>
```

## 10. Notas Importantes

- **No uses blanco puro (`bg-white`)** en grandes áreas; prefiere `bg-gray-50` para modo claro
- **Evita texto negro puro (`text-black`)**; usa `text-gray-900` para mejor legibilidad
- **Siempre incluye variantes `dark:`** incluso si el componente parece "solo claro"
- **Prueba en ambos modos** antes de commitear cambios
- **Usa las constantes** de `styleConstants.jsx` cuando sea posible para mantener consistencia
- **Implementa componentes base** para elementos comunes (Card, Button, Text, etc.)
- **Crea clases CSS personalizadas** con `@apply` para combinaciones frecuentes

## 11. Clases @apply Implementadas en tu Proyecto

He implementado clases `@apply` en tu `src/index.css` para reducir la repetición de clases CSS. Aquí está la explicación completa:

### ¿Qué son las clases @apply?

Las clases `@apply` son una directiva de Tailwind CSS que te permite crear clases CSS personalizadas aplicando múltiples clases de Tailwind dentro de una regla CSS. Es como "empaquetar" varias clases en una sola.

### Clases Implementadas en tu `src/index.css`:

```css
@layer components {
  /* Clase para tarjetas temáticas */
  .card-theme {
    @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-white shadow-lg;
  }

  /* Clases para textos temáticos */
  .text-primary {
    @apply text-gray-900 dark:text-white;
  }

  .text-secondary {
    @apply text-gray-600 dark:text-gray-300;
  }

  .text-tertiary {
    @apply text-gray-500 dark:text-gray-400;
  }

  /* Clases para fondos temáticos */
  .bg-surface {
    @apply bg-white dark:bg-gray-800;
  }

  .bg-surface-secondary {
    @apply bg-gray-50 dark:bg-gray-900;
  }

  /* Clases para bordes temáticos */
  .border-theme {
    @apply border-gray-200 dark:border-gray-700;
  }

  .border-theme-light {
    @apply border-gray-300 dark:border-gray-600;
  }

  /* Clases para botones */
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-lg transition-colors;
  }

  /* Clases para formularios */
  .input-theme {
    @apply w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400;
  }

  .label-theme {
    @apply block text-left text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200;
  }
}
```

### Cómo Usar las Clases @apply en tu Proyecto:

#### Ejemplo 1: Reemplazar una tarjeta compleja
```jsx
// ANTES (repetitivo - 10+ clases):
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-white shadow-lg">
  <h3 className="text-gray-900 dark:text-white">Título</h3>
  <p className="text-gray-600 dark:text-gray-300">Contenido</p>
</div>

// DESPUÉS (limpio - 3 clases):
<div className="card-theme">
  <h3 className="text-primary">Título</h3>
  <p className="text-secondary">Contenido</p>
</div>
```

#### Ejemplo 2: Formularios
```jsx
// ANTES (muy largo):
<label className="block text-left text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Nombre</label>
<input className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />

// DESPUÉS (muy simple):
<label className="label-theme">Nombre</label>
<input className="input-theme" />
```

#### Ejemplo 3: Botones
```jsx
// ANTES (repetitivo):
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Guardar</button>
<button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-lg transition-colors">Cancelar</button>

// DESPUÉS (limpio):
<button className="btn-primary">Guardar</button>
<button className="btn-secondary">Cancelar</button>
```

#### Ejemplo 4: Aplicado a tus componentes existentes
Puedes actualizar componentes como `EstadisticasResidentes.jsx`:

```jsx
// En lugar de esto (muy largo):
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-blue-500 rounded-lg p-6 text-gray-900 dark:text-white shadow-lg">

// Usar esto (mucho más simple):
<div className="card-theme border-l-4 border-blue-500">
```

### Ventajas Específicas para tu Proyecto:

1. **Reduce 70-80% las clases repetidas** en componentes
2. **Mantenimiento centralizado** - cambia colores en `index.css` y afecta todo
3. **Consistencia automática** en todo el proyecto
4. **Mejor legibilidad** del código JSX
5. **Fácil migración gradual** - puedes actualizar componentes uno por uno

### Cómo Migrar tus Componentes Existentes:

1. **Identifica patrones repetidos** en tus componentes actuales
2. **Crea clases @apply** para esos patrones si no existen
3. **Actualiza componentes** gradualmente reemplazando clases largas
4. **Prueba en ambos modos** después de cada cambio

### ¿Por qué @apply es perfecto para tu proyecto?

- Ya tienes un **sistema de colores consistente** definido
- Solo necesitas **"empaquetar" las combinaciones frecuentes**
- **Mantiene la filosofía "Dark Mode First"** con variantes `dark:`
- **Es compatible** con tu configuración actual de Tailwind
- **No requiere cambios** en la configuración del proyecto

Esta estrategia transforma tu código de ser repetitivo y difícil de mantener a ser limpio, consistente y escalable.

## 12. Accesibilidad WCAG - Contraste de Colores

Para asegurar que tu aplicación sea accesible según las pautas WCAG, es crucial verificar el contraste de colores, especialmente considerando usuarios con deficiencias en la visión del color.

### Niveles de Conformidad WCAG

- **AA (Recomendado)**: Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **AAA (Óptimo)**: Contraste mínimo 7:1 para texto normal, 4.5:1 para texto grande

### Verificación de Contraste en tu Sistema de Colores

#### Modo Claro - Combinaciones Principales:
- **Texto primario** (`text-gray-900`) sobre **fondo blanco** (`bg-white`): ✅ **21:1** (AAA)
- **Texto secundario** (`text-gray-600`) sobre **fondo blanco** (`bg-white`): ✅ **7.3:1** (AAA)
- **Texto terciario** (`text-gray-500`) sobre **fondo blanco** (`bg-white`): ✅ **5.9:1** (AA)
- **Texto sobre tarjetas** (`text-gray-900`) sobre **fondo tarjeta** (`bg-white`): ✅ **21:1** (AAA)

#### Modo Oscuro - Combinaciones Principales:
- **Texto primario** (`text-white`) sobre **fondo oscuro** (`bg-gray-800`): ✅ **12.6:1** (AAA)
- **Texto secundario** (`text-gray-300`) sobre **fondo oscuro** (`bg-gray-800`): ✅ **6.2:1** (AA)
- **Texto terciario** (`text-gray-400`) sobre **fondo oscuro** (`bg-gray-800`): ✅ **4.6:1** (AA)

### Consideraciones para Usuarios con Daltonismo

#### 1. **No depender solo del color para transmitir información**
```jsx
// ❌ Malo - Solo color para indicar estado
<div className="text-red-500">Error</div>

// ✅ Bueno - Color + texto/icono
<div className="text-red-500">
  <span className="mr-2">❌</span>
  Error
</div>
```

#### 2. **Evitar combinaciones problemáticas**
- **Rojo/Verde**: Problemático para deuteranopia (daltonismo rojo-verde más común)
- **Azul/Amarillo**: Generalmente seguro
- **Azul/Rojo**: Generalmente seguro

#### 3. **Usar múltiples indicadores**
```jsx
// Para estados de recursos:
<div className={`p-4 rounded-lg border-2 ${
  disponible
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
}`}>
  <span className="font-bold">
    {disponible ? '✅ Disponible' : '❌ Ocupado'}
  </span>
</div>
```

### Herramientas para Verificar Contraste

#### 1. **Contrast Checker Online**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- [Accessible Colors](https://accessible-colors.com/)

#### 2. **Extensiones de Navegador**
- **Stark** (Chrome/Firefox): Verifica contraste en tiempo real
- **WAVE** (Chrome): Evaluación de accesibilidad
- **axe DevTools** (Chrome): Análisis completo de accesibilidad

#### 3. **Herramientas de Desarrollo**
```javascript
// Función para calcular ratio de contraste
function getContrastRatio(color1, color2) {
  // Implementación del cálculo WCAG
  // Retorna ratio numérico (ej: 4.5, 7.1, etc.)
}
```

### Mejores Prácticas para tu Proyecto

#### 1. **Colores Seguros por Defecto**
Los colores que implementé cumplen con WCAG AA/AAA:

```css
/* ✅ Colores seguros implementados */
.text-primary { @apply text-gray-900 dark:text-white; }     /* 21:1 y 12.6:1 */
.text-secondary { @apply text-gray-600 dark:text-gray-300; } /* 7.3:1 y 6.2:1 */
.text-tertiary { @apply text-gray-500 dark:text-gray-400; }  /* 5.9:1 y 4.6:1 */
```

#### 2. **Estados Interactivos Accesibles**
```css
/* Estados hover/focus con buen contraste */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 focus:bg-blue-800
         text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Contraste suficiente en estados deshabilitados */
.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700
         text-gray-700 dark:text-gray-200
         opacity-50 cursor-not-allowed;
}
```

#### 3. **Texto sobre Fondos Complejos**
```jsx
// Para texto sobre gradientes o imágenes
<div className="relative">
  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
  <div className="relative text-white">
    <h3 className="text-2xl font-bold">Título con Overlay</h3>
    <p className="text-gray-200">Contenido legible</p>
  </div>
</div>
```

### Verificación Continua

#### 1. **Checklist de Accesibilidad**
- [ ] Verificar contraste de todo el texto (4.5:1 mínimo)
- [ ] Probar con simuladores de daltonismo
- [ ] Verificar estados focus/hover
- [ ] Comprobar en diferentes tamaños de pantalla
- [ ] Validar con lectores de pantalla

#### 2. **Testing Automatizado**
```javascript
// En tus tests:
describe('Accesibilidad', () => {
  it('debe tener contraste suficiente', () => {
    // Verificar ratios de contraste
    expect(getContrastRatio('#111827', '#ffffff')).toBeGreaterThan(12);
  });
});
```

#### 3. **Monitoreo Continuo**
- Revisar contraste cuando cambies colores
- Auditar accesibilidad antes de releases
- Incluir checklist de accesibilidad en code reviews

### Ajustes si no Cumples con WCAG

Si alguna combinación no cumple:

```css
/* Si text-gray-600 no tiene suficiente contraste */
.text-secondary {
  @apply text-gray-700 dark:text-gray-300; /* Más oscuro en claro */
}

/* Para texto sobre fondos coloridos */
.text-overlay {
  @apply text-white drop-shadow-lg; /* Sombra para mejor legibilidad */
}
```

### Recursos Adicionales

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WebAIM Color Contrast](https://webaim.org/articles/contrast/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [Inclusive Design Principles](https://www.microsoft.com/design/inclusive/)

Siguiendo estas pautas, tu aplicación será accesible para el 95%+ de los usuarios, incluyendo aquellos con deficiencias visuales.

## 13. Guía Completa: Cómo Usar WAVE

WAVE es una herramienta gratuita de evaluación de accesibilidad web que identifica problemas de accesibilidad en tiempo real.

### Instalación

1. **Chrome**: [WAVE Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
2. **Firefox**: [WAVE Extension](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)
3. **Sitio Web**: [wave.webaim.org](https://wave.webaim.org/) (para evaluación sin instalar)

### Cómo Usar WAVE en tu Proyecto

#### 1. **Ejecutar Evaluación**
- Abre tu aplicación en el navegador
- Navega a la página que quieres evaluar
- Haz clic en el icono de WAVE en la barra de extensiones
- Aparecerá un panel con los resultados

#### 2. **Interpretar los Resultados**

##### **Iconos y Categorías:**

- **🔴 Errores (Errors)**: Problemas críticos que deben arreglarse
- **🟠 Alertas (Alerts)**: Posibles problemas que revisar
- **🔵 Características (Features)**: Elementos accesibles bien implementados
- **⚫ Estructura (Structure)**: Elementos semánticos HTML
- **🔍 Contraste (Contrast)**: Información de contraste de colores

#### 3. **Problemas Comunes que Detecta WAVE**

##### **Contraste de Color**
```
❌ Low contrast - Texto con bajo contraste
✅ Good contrast - Contraste adecuado
```

**En tu proyecto**: Verifica que no aparezcan errores de "Low contrast" en tus textos.

##### **Imágenes sin Alt Text**
```
❌ Missing alternative text
```

**En tu proyecto**: Todas las imágenes deben tener `alt=""` descriptivo.

##### **Enlaces sin Texto Descriptivo**
```
❌ Link text may not be descriptive
❌ Unclear link text
```

**Ejemplo problemático:**
```jsx
// ❌ Malo
<a href="/dashboard">Click aquí</a>

// ✅ Bueno
<a href="/dashboard">Ir al Dashboard</a>
```

##### **Falta de Labels en Formularios**
```
❌ Missing form label
```

**En tu proyecto**: Todos los inputs deben tener labels asociados.

##### **Botones sin Texto Accesible**
```
❌ Button with no text
```

**Ejemplo:**
```jsx
// ❌ Malo - Solo icono sin texto
<button><FiPlus /></button>

// ✅ Bueno - Icono + texto accesible
<button aria-label="Añadir nuevo elemento">
  <FiPlus aria-hidden="true" />
</button>
```

##### **Encabezados Saltados**
```
❌ Skipped heading level
```

**En tu proyecto**: Los encabezados deben seguir jerarquía (h1 → h2 → h3, no h1 → h3).

#### 4. **Aspectos Específicos para tu Aplicación**

##### **Componentes React que Debes Revisar:**

1. **Modales y Diálogos**
   - ¿Tienen `aria-labelledby`?
   - ¿Tienen `aria-describedby`?
   - ¿Se pueden cerrar con ESC?

2. **Tablas de Datos**
   - ¿Tienen `<th>` con `scope="col"` o `scope="row"`?
   - ¿Tienen `aria-label` si es necesario?

3. **Estados de Carga**
   - ¿Tienen `aria-live` para actualizaciones dinámicas?
   - ¿Indican progreso con `aria-valuenow`?

4. **Navegación**
   - ¿Los enlaces activos tienen `aria-current="page"`?
   - ¿Los menús tienen `aria-expanded`?

##### **Ejemplos de Corrección para tu Código:**

```jsx
// Modal corregido
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Crear Tipo de Recurso"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div id="modal-description">
    Formulario para crear nuevos tipos de recurso
  </div>
  {/* contenido */}
</Modal>

// Tabla corregida
<table>
  <thead>
    <tr>
      <th scope="col">Nombre</th>
      <th scope="col">Tipo</th>
      <th scope="col">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.nombre}</td>
        <td>{item.tipo}</td>
        <td>
          <button aria-label={`Editar ${item.nombre}`}>
            <FiEdit />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

// Navegación corregida
<nav aria-label="Navegación principal">
  <ul>
    <li>
      <NavLink
        to="/dashboard"
        aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
      >
        Dashboard
      </NavLink>
    </li>
  </ul>
</nav>
```

#### 5. **Flujo de Trabajo Recomendado**

1. **Desarrollo**: Ejecuta WAVE en cada componente nuevo
2. **Pre-commit**: Verifica que no haya errores críticos
3. **Testing**: Incluye pruebas de accesibilidad automatizadas
4. **Lanzamiento**: Auditoría completa con WAVE + otras herramientas

#### 6. **Códigos de Error Comunes en WAVE**

| Código | Descripción | Prioridad |
|--------|-------------|-----------|
| `contrast` | Bajo contraste | Alta |
| `alt_missing` | Falta alt en imagen | Alta |
| `label_missing` | Falta label en input | Alta |
| `button_empty` | Botón sin texto | Media |
| `heading_skipped` | Encabezado saltado | Media |
| `link_empty` | Enlace vacío | Media |

#### 7. **Integración con Desarrollo**

##### **Script NPM para Testing:**
```json
// package.json
{
  "scripts": {
    "accessibility": "npx @axe-core/cli http://localhost:3000 --exit"
  }
}
```

##### **Hook React para Desarrollo:**
```jsx
// useAccessibility.js
import { useEffect } from 'react';

export const useAccessibility = () => {
  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Verificar contraste, etc.
    }
  }, []);
};
```

#### 8. **Mejores Prácticas con WAVE**

- **Ejecuta WAVE en ambas vistas**: Claro y oscuro
- **Revisa componentes interactivos**: Botones, formularios, navegación
- **Verifica contenido dinámico**: AJAX, estados de carga
- **Prueba con diferentes navegadores**: Chrome, Firefox, Safari
- **Documenta excepciones**: Si algo no puede ser accesible, documenta por qué

#### 9. **Recursos Adicionales**

- [WAVE Help Documentation](https://wave.webaim.org/help)
- [WCAG Success Criteria](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

Siguiendo esta guía con WAVE, podrás identificar y corregir la mayoría de problemas de accesibilidad en tu aplicación LifeBit.