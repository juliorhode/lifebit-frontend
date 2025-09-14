# 📋 Módulo de Residentes - LifeBit

## 🎯 **Descripción General**

El módulo de residentes permite a los administradores gestionar la invitación y administración de residentes en su edificio. Incluye funcionalidades para invitaciones individuales y masivas, seguimiento de estado, y un sistema de borradores para mejorar la experiencia del usuario.

## 🏗️ **Arquitectura del Módulo**

```
src/modules/residentes/
├── pages/
│   ├── ResidentesPage.jsx          # Página principal del módulo
│   └── ResidentesPageSetup.jsx     # Placeholder para setup wizard
├── components/
│   ├── EstadisticasResidentes.jsx      # Panel de métricas
│   ├── BorradoresPanel.jsx             # Gestión de borradores
│   ├── ListaResidentes.jsx             # Tabla de residentes
│   ├── InvitarResidenteModal.jsx       # Modal invitación individual
│   └── InvitarResidentesMasivoModal.jsx # Modal invitación masiva
├── hooks/
│   └── (futuro: useResidentes.js)      # Lógica personalizada
└── utils/
    └── (futuro: validaciones.js)       # Utilidades
```

## 🚀 **Funcionalidades Implementadas**

### **1. Gestión de Residentes**
- ✅ **Lista completa** de residentes con filtros y búsqueda
- ✅ **Estados de residentes**: Invitado → Activo → Suspendido
- ✅ **Información detallada**: Nombre, email, unidad
- ✅ **Acciones**: Cambiar estado, eliminar residentes

### **2. Sistema de Invitaciones**
- ✅ **Invitación individual** con formulario validado
- ✅ **Invitación masiva** mediante archivo Excel
- ✅ **Validaciones robustas** usando Yup
- ✅ **Manejo de errores** específico por tipo
- ✅ **Feedback visual** durante el proceso

### **3. Sistema de Borradores**
- ✅ **Auto-guardado** cada 30 segundos
- ✅ **Persistencia** en localStorage
- ✅ **Expiración automática** (7 días)
- ✅ **Panel motivacional** (Principio Zeigarnik)
- ✅ **Continuar invitaciones** pendientes

### **4. Dashboard y Estadísticas**
- ✅ **Métricas visuales** de residentes
- ✅ **Indicador de progreso** en dashboard principal
- ✅ **Feedback motivacional** para completar registro

### **5. Integración con Setup Wizard**
- ✅ **Transición automática** desde Recursos → Residentes
- ✅ **Placeholder informativo** para onboarding
- ✅ **Botón condicional** (solo con recursos creados)

## 🎨 **Principios UX Aplicados**

### **Zeigarnik Effect (Efecto Zeigarnik)**
- **Aplicación**: Borradores pendientes motivan completación
- **Implementación**: Panel de borradores en módulo principal
- **Resultado**: Aumento en tasa de finalización de invitaciones

### **Hick's Law (Ley de Hick)**
- **Aplicación**: Interfaces simples con opciones limitadas
- **Implementación**: Formularios progresivos, acciones claras
- **Resultado**: Decisiones más rápidas y menos errores

### **Peak-End Rule (Regla Pico-Final)**
- **Aplicación**: Finalizar flujos con feedback positivo
- **Implementación**: Mensajes de éxito destacados
- **Resultado**: Experiencia memorable y satisfactoria

## 🔧 **APIs Utilizadas**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /admin/residentes` | GET | Obtener lista completa de residentes |
| `POST /admin/invitaciones/residentes` | POST | Invitar residente individual |
| `POST /admin/invitaciones/residentes-masivo` | POST | Invitación masiva con Excel |
| `PATCH /admin/residentes/:id` | PATCH | Actualizar residente |
| `DELETE /admin/residentes/:id` | DELETE | Eliminar residente |
| `POST /admin/configuracion/avanzar-paso` | POST | Avanzar paso del setup |

## 📱 **Flujo de Usuario**

### **Setup Wizard**
1. **Paso 1**: Configurar unidades
2. **Paso 2**: Crear recursos → Botón "Continuar" aparece
3. **Paso 3**: Placeholder motivacional → Redirige a módulo completo

### **Módulo Completo**
1. **Dashboard**: Ver estadísticas y borradores pendientes
2. **Invitar**: Individual o masiva según necesidad
3. **Gestionar**: Lista con filtros, editar, eliminar
4. **Seguimiento**: Indicador de progreso en dashboard principal

## 🛠️ **Tecnologías y Librerías**

- **React**: Componentes funcionales con hooks
- **Zustand**: Gestión de estado global
- **React Hook Form**: Formularios con validación
- **Yup**: Schema validation
- **React Hot Toast**: Notificaciones
- **Tailwind CSS**: Estilos utilitarios
- **Axios**: Cliente HTTP (apiService)

## 🔒 **Consideraciones de Seguridad**

- ✅ **Validación frontend**: Prevención de datos inválidos
- ✅ **Sanitización**: Inputs limpios antes de envío
- ✅ **Manejo de errores**: Sin exposición de información sensible
- ✅ **Tokens seguros**: Uso de refreshToken en HttpOnly cookies

## 🧪 **Testing y Validación**

### **Casos de Uso Probados**
- ✅ Invitación individual con datos válidos
- ✅ Invitación masiva con archivo Excel válido
- ✅ Manejo de errores de red y validación
- ✅ Sistema de borradores con expiración
- ✅ Transición del setup wizard

### **Validaciones Implementadas**
- ✅ **Email único** por edificio
- ✅ **Unidad existente** en el edificio
- ✅ **Roles permitidos**: residente, propietario
- ✅ **Tamaño de archivos**: Excel ≤ 10MB
- ✅ **Formato Excel**: Columnas requeridas

## 📚 **Guía de Desarrollo**

### **Agregar Nueva Funcionalidad**
1. **Crear componente** en `components/`
2. **Documentar** con JSDoc completo
3. **Agregar validaciones** si maneja datos
4. **Integrar** en página principal
5. **Probar** funcionalidad completa

### **Modificar APIs**
⚠️ **IMPORTANTE**: Este módulo usa APIs existentes del backend.
**NO modificar endpoints** - trabajar solo con lo disponible.

### **Estilos y UI**
- Mantener consistencia con módulo de recursos
- Usar Tailwind CSS para nuevos componentes
- Seguir patrón de colores establecido

## 🚀 **Próximas Mejoras (ADR)**

### **Funcionalidades Futuras**
- **Historial de invitaciones** enviadas
- **Notificaciones push** para residentes
- **Roles avanzados** con permisos granulares
- **Importación desde otros sistemas**

### **Mejoras UX**
- **Drag & drop** para reordenar residentes
- **Búsqueda avanzada** con múltiples filtros
- **Exportación** de datos a Excel/PDF
- **Dashboard personalizado** por edificio

---

**📅 Última actualización**: Diciembre 2024
**👨‍💻 Desarrollado por**: Kilo Code
**🎯 Estado**: ✅ Completo y funcional