# LifeBit: Visión y Blueprint Arquitectónico (v1.0)

## Prólogo: Nuestro Manifiesto

Este documento es la **única fuente de verdad** para el desarrollo de LifeBit. Es el resultado de un análisis profundo y representa nuestra visión compartida, nuestros principios inquebrantables y el plan arquitectónico para construir una plataforma SaaS de clase mundial. No es un documento estático; es un legado vivo que nos guiará y mantendrá enfocados.

---

## 1. La Visión (El "Porqué")

LifeBit no es un software de gestión. Es una herramienta para **restaurar la paz, la confianza y el sentido de comunidad en los condominios.** Cada funcionalidad, cada pixel y cada línea de código debe servir a esta misión a través de nuestros tres pilares fundamentales:

*   **Pilar 1: Transparencia Radical.** El residente debe entender cada céntimo que paga. Las finanzas deben ser claras como el cristal, accesibles y auditables. La desconfianza se combate con datos abiertos.
*   **Pilar 2: Eficiencia Operativa.** El tiempo de un administrador es valioso. Automatizaremos las tareas tediosas, repetitivas y propensas a errores para liberar al administrador, permitiéndole enfocarse en lo que realmente importa: gestionar y mejorar la comunidad.
*   **Pilar 3: Fomento de la Comunidad.** Un condominio es más que un edificio; es un hogar compartido. Facilitaremos la comunicación, la participación democrática y la colaboración entre vecinos, convirtiendo los espacios compartidos en comunidades prósperas.

---

## 2. Los Principios (El "Credo")

Estos son los mandamientos no negociables que rigen nuestro trabajo. Son el "cómo" construimos.

### 2.1. Principios de Ingeniería de Software (El Credo de Ark)

*   **SOLID, DRY, KISS, YAGNI:** Nuestro código será simple, modular, sin duplicación y enfocado en las necesidades reales del ahora.
*   **Arquitectura Orientada al Futuro:** Cada decisión se toma pensando en la escalabilidad. Empezamos con un MVP, pero la estructura debe estar lista para crecer (internacionalización, roles complejos).
*   **Documentación como Legado:** El código bien comentado (el *porqué*) es tan importante como el código funcional (el *qué*).

### 2.2. Principios de Experiencia de Usuario (El Credo del Psicólogo)

*   **Empoderamiento Guiado:** La interfaz debe ser potente pero nunca abrumadora. Usaremos plantillas, asistentes (`Wizards`) y simulaciones para dar al usuario superpoderes sin que necesite un manual de instrucciones.
*   **Cero Fricción:** Cada clic innecesario, cada campo ambiguo, cada paso confuso es un enemigo a eliminar. El camino del usuario para completar una tarea debe ser lo más corto y placentero posible.
*   **Diseño Basado en Hábitos (Modelo Hook):** Diseñaremos bucles de feedback (Disparador -> Acción -> Recompensa -> Inversión) que hagan del uso de LifeBit un hábito positivo y gratificante.

### 2.3. Principios de Seguridad (El Credo del Guardián)

*   **Confianza Cero (Zero Trust):** Nunca confiaremos implícitamente en ninguna petición, dato o usuario. Cada capa de la aplicación valida y verifica.
*   **Seguridad por Diseño:** La seguridad se diseña desde el modelo de datos (`schema.txt`), pasando por los middlewares, hasta la validación en el frontend.
*   **Aislamiento de Tenants:** La regla de oro. Los datos de un condominio son absolutamente inaccesibles para otro. Cada consulta a la base de datos estará rigurosamente filtrada por el `id_edificio`.

---

## 3. Las Personas (El "Quién")

Construimos para tres arquetipos de usuario muy definidos:

*   **El Dueño de la App (Nosotros):** Necesita una vista de pájaro del negocio. Su foco está en el crecimiento, la salud financiera del SaaS y la gestión de clientes a alto nivel.
*   **El Administrador:** Nuestro "Power User". Es el corazón operativo de un condominio. Necesita herramientas eficientes y potentes que le ahorren tiempo y le den control total. **Asumimos que no es un experto en tecnología.**
*   **El Residente:** El consumidor final. Valora la transparencia, la conveniencia y la comunicación. Quiere entender sus pagos, participar en su comunidad y resolver sus necesidades de forma rápida y sencilla.

---

## 4. El Blueprint Arquitectónico (El "Cómo Técnico")

Estas son las decisiones de arquitectura fundamentales basadas en `schema.txt` y nuestras conversaciones.

### 4.1. Modelo de Datos MVP (ADR-001)
Para acelerar el lanzamiento del Producto Mínimo Viable (MVP), adoptamos una estructura de roles simplificada.

*   **Modelo V1:** La tabla `usuarios` contiene las columnas `rol` y `id_edificio_actual`. Esto establece una relación directa y simple: **un usuario pertenece a un solo edificio y tiene un solo rol.**
*   **Evolución Planificada (V2):** El modelo está diseñado para evolucionar. La funcionalidad de "Gestor" (un administrador para múltiples edificios) se implementará en una fase posterior mediante la introducción de una tabla `afiliaciones`. Esta tabla de unión separará la identidad (`usuarios`) de la función (`rol` en un `edificio` específico), permitiendo una verdadera arquitectura multi-tenant sin requerir una migración de datos masiva.

### 4.2. El Motor de Reglas: El Sistema Nervioso de LifeBit
Esta es nuestra *killer feature*. No es un módulo, es el núcleo de la automatización.

*   **Modelo:** Evento-Condición-Acción (ECA).
*   **Interfaz de Usuario:** Un lienzo **drag-and-drop** con bloques predefinidos, diseñado para ser usado por no-tecnólogos.
*   **Ciclo de Vida de la Regla:** El sistema incluirá:
    1.  **Ayuda Guiada:** Plantillas y ayuda contextual.
    2.  **Simulador de Impacto:** Una herramienta para previsualizar a cuántos usuarios afectará una regla *antes* de guardarla.
    3.  **Validación Robusta:** En frontend y backend.
    4.  **Gestión Centralizada:** Una vista para activar/desactivar, editar, eliminar y **establecer la vigencia** de las reglas.
*   **Almacenamiento:** Una columna `jsonb` en la tabla `reglas`.

### 4.3. Arquitectura Financiera
*   **Moneda Funcional:** Se operará con una "moneda funcional" por edificio (ej. `USD`), definida en `edificios.moneda_funcional`.
*   **Registro de Pagos:** Los pagos en moneda local (ej. `VES`) se registrarán con una clave foránea a la tabla `tasas_cambio`, creando un registro de auditoría perfecto. Las tasas se obtendrán vía web scraping.
*   **Conciliación Inteligente:** La conciliación se hará mediante un sistema de "mapeo de plantillas" que el administrador configurará una vez por cada formato de estado de cuenta bancario.
*   **Planificación:** El OCR para leer comprobantes de pago se pospone para una Fase 2.

### 4.4. Stack Tecnológico y Patrones
*   **Backend:** Node.js con Express.js.
*   **Base de Datos:** PostgreSQL.
*   **Frontend:** React (con Vite).
*   **Estilos:** Tailwind CSS ("Dark Mode First").
*   **Manejo de Estado:** Zustand.
*   **Autenticación:** JWT (`accessToken` en memoria, `refreshToken` en cookie `HttpOnly`) y OAuth 2.0 para Google.
*   **Tareas en Segundo Plano:** Se usará una cola de trabajos (`cola_de_trabajos`) para operaciones asíncronas (envío de emails, scraping, procesamiento de archivos).

---

## 5. Procesos Clave de la Aplicación (El "Cómo Funciona")

Esta sección describe la lógica de negocio de los flujos de trabajo más importantes.

### 5.1. Flujo de Onboarding de un Nuevo Cliente
1.  **Solicitud:** Un cliente potencial llena el formulario en la Landing Page. Se crea un registro en `solicitudes_servicio` (estado: `pendiente`).
2.  **Revisión y Aprobación (Dueño):** El Dueño de la App revisa la solicitud en su panel. Al hacer clic en "Aprobar", el backend ejecuta una **transacción** de base de datos que:
    a. Crea la `licencia` y el `contrato` (estado: `en_prueba`).
    b. Crea el `edificio`, asociándolo al contrato.
    c. Crea el `usuario` (rol: `administrador`, estado: `invitado`), asociándolo al `id_edificio_actual`.
    d. Genera un `token_registro` único y lo guarda en el nuevo `usuario`.
    e. Añade un trabajo a la `cola_de_trabajos` para enviar el email de invitación.
    f. Actualiza la `solicitud_servicio` a `aprobado`.
3.  **Activación (Administrador):** El nuevo admin recibe el email, hace clic en el enlace, y es llevado a la `FinalizarRegistroPage` para establecer su contraseña o vincular su cuenta de Google. Al finalizar, su estado cambia a `activo` y el `token_registro` es anulado.

### 5.2. Ciclo Financiero del Condominio (El Corazón de la Transparencia)
1.  **Acumulación de Gastos:** Durante el mes, el Administrador registra todas las facturas y costos en la tabla `gastos`.
2.  **Generación de Recibos:** Al final del mes, el Admin acciona "Generar Recibos". El backend:
    a. Crea un `recibos_maestro` para el mes/año/edificio.
    b. Suma todos los `gastos` del período.
    c. Busca `multas` pendientes y cargos por `reservas`.
    d. Itera sobre cada `unidad` del edificio.
    e. Calcula la deuda de la unidad (gastos * alícuota + cargos individuales).
    f. Crea un registro en `recibos_unidad` y múltiples registros en `detalles_recibo` para cada concepto.
3.  **Reporte de Pago (Residente):** El Residente visualiza su `recibos_unidad` y hace clic en "Pagar". Rellena un formulario reportando los detalles de su transferencia. Esto crea un registro en `pagos` (estado: `en_verificacion`).
4.  **Conciliación (Administrador):** El Admin recibe una notificación. Descarga su estado de cuenta bancario y lo sube a LifeBit.
5.  **Match Automático (Backend):** El "Servicio de Conciliación" se activa. Lee el archivo (usando la plantilla de mapeo guardada), y compara cada línea con los `pagos` en estado `en_verificacion` usando la clave (`banco`, `referencia`, `cedula`, `monto`, `fecha`).
    a. **Match Perfecto:** El `pago` se marca como `validado`. Se crea un registro en `aplicacion_pagos` que vincula el pago a la deuda. El `saldo_restante` en `recibos_unidad` se actualiza.
    b. **Sin Match:** El pago permanece `en_verificacion` para revisión manual del Admin.

### 5.3. Ejecución de una Regla (Ejemplo)
1.  **Evento:** Un residente solicita una reserva para el Salón de Fiestas. La petición llega al controlador de `reservas`.
2.  **Invocación:** Antes de procesar la solicitud, el controlador llama al `MotorDeReglasService.evaluar('NUEVA_RESERVA', datos_contexto)`. `datos_contexto` contiene info sobre el residente, la reserva, etc.
3.  **Evaluación:** El servicio busca en la tabla `reglas` todas las reglas activas para ese `evento_disparador` y `id_edificio`.
4.  **Ejecución:** Itera sobre cada regla encontrada. Para una regla que dice `SI residente.deuda_total > 50 ENTONCES RECHAZAR_RESERVA`, el servicio:
    a. Consulta la deuda actual del residente.
    b. La condición se cumple.
    c. El servicio no continúa, y devuelve una acción (`RECHAZAR_RESERVA`) al controlador.
5.  **Acción del Controlador:** El controlador recibe la instrucción, no crea la reserva (o la crea con estado `rechazada`) y devuelve una respuesta de error al frontend explicando por qué fue rechazada.

---

## 6. Epopeyas Funcionales (El "Qué")

### Epopeya 1: Onboarding y Acceso
- Landing Page (CMS) con reordenamiento drag-and-drop.
- Flujo de Solicitud de Servicio, Aprobación y Activación.
- Autenticación Híbrida (Email/Pass + Google).

### Epopeya 2: Finanzas y Contabilidad
- **Contabilidad de Partida Doble:** `plan_de_cuentas`, `asientos_contables`, `movimientos_contables`.
- Ciclo de Vida del Recibo: Desde `gastos` hasta `recibos_unidad` y `detalles_recibo`.
- Conciliación de Pagos: Carga de estados de cuenta y "matching" automático.
- Gestión de Multas y Cuentas Bancarias.
- Dashboards Financieros con gráficos.

### Epopeya 3: Comunidad e Interacción
- Noticias y Anuncios con targeting (global, por grupo, por edificio).
- Foro de Discusiones (simple, accesible, con hilos y respuestas anidadas).
- Consultas Populares: Sistema unificado para Encuestas, Votaciones y Elecciones.
- Flujo de Elecciones: Desde la postulación hasta la votación secreta y resultados.
- Reserva de Áreas Comunes con calendario de disponibilidad.

### Epopeya 4: Automatización y Gestión Operativa
- **Motor de Reglas Visual:** Nuestra *killer feature*.
- Gestión de Recursos (CRUD de tipos, asignación visual).
- Gestión de Residentes (CRUD, invitación individual y masiva).
- Sistema de Ticketing/Reportes (Residente -> Admin, Admin -> Dueño).
- Emisión de Cartas (ej. solvencia).

### Epopeya 5: Soporte y Auditoría
- **Auditoría:** Registro automático inmutable de todas las acciones de escritura.
- **Notificaciones Multicanal:** Sistema de notificaciones (Email, WhatsApp, etc.) gestionado por el motor de reglas.
- **SQL Runner:** Herramienta de soporte de BD para el Dueño (con máxima seguridad y auditoría).
- **FAQ y Chatbot:** Centro de ayuda para todos los usuarios.