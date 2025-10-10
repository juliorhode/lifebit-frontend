Entendido. La directiva es crear la "Biblia del Proyecto LifeBit": un documento único y exhaustivo que contenga no solo los artefactos que ya creamos (roadmaps, esquema de BD), sino también una descripción narrativa detallada de cada flujo de trabajo y funcionalidad para cada rol.

Este será nuestro documento de referencia maestro, el contexto definitivo. Acepto la responsabilidad de crearlo con el máximo detalle y profundidad para asegurar que nunca más tengamos que empezar de cero.

Artefacto 4: Documentación Maestra de Procesos y Flujos de Trabajo "LifeBit"

Este documento es la fuente única de verdad para toda la lógica de negocio y los flujos de usuario de la plataforma.

Parte 1: Flujos Públicos y Onboarding General
1.1. Landing Page (Portal Público)

Propósito: Es la cara de LifeBit al mundo. Su objetivo es informar, atraer y convertir a potenciales clientes (condominios).

Funcionalidad:

Contenido Dinámico (CMS): Todas las secciones (Héroe, Características, Sobre Nosotros, Planes, Contacto) son gestionadas desde el panel de Dueños. La página se renderiza dinámicamente a partir de los datos de la tabla contenidos_landing.

Formulario de Solicitud de Servicio: Es el "Call to Action" principal. Un visitante (ej. el presidente de una junta de condominio) rellena un formulario con sus datos personales, los datos del edificio que representa, y el plan que desea contratar. Puede adjuntar archivos como su cédula y el documento de condominio.

Ejemplo de Flujo:

Un visitante, Sr. Pérez, llega a lifebit.com.

Lee sobre los planes y decide contratar el plan "Premium".

Va a la sección "Solicitar Servicio".

Rellena el formulario: nombre: "Carlos Pérez", email: "c.perez@edificio-sol.com", nombre_edificio: "Residencias El Sol", ...

Adjunta cedula.pdf y documento_condominio.pdf.

Al enviar, se crea un registro en la tabla solicitudes_servicio con estado 'pendiente'. El Sr. Pérez ve un mensaje de "Gracias, hemos recibido tu solicitud y te contactaremos pronto".

1.2. Flujo de Login Unificado

Propósito: Proveer un único punto de entrada para todos los usuarios registrados.

Funcionalidad:

La página de login (/login) ofrece dos métodos: Email/Contraseña y "Iniciar sesión con Google".

El backend, al recibir las credenciales, identifica al usuario, verifica su rol (dueño_app, administrador, residente) y su estado (activo).

Si la autenticación es exitosa, la API devuelve los tokens de sesión (JWT) y el rol del usuario.

El frontend es responsable de redirigir al usuario al dashboard correspondiente basado en el rol recibido.

Parte 2: Panel del Dueño de la Aplicación

Propósito General: Control total sobre la plataforma, los clientes y las finanzas del negocio SaaS.

2.1. Dashboard: Vista de pájaro de las operaciones. Muestra widgets con contadores y enlaces a:

Nuevas Solicitudes de Servicio: COUNT(*) FROM solicitudes_servicio WHERE estado = 'pendiente'.

Pagos de Licencia por Verificar: COUNT(*) FROM pagos WHERE tipo_pago = 'licencia_saas' AND estado = 'en_verificacion'.

Incidencias de Plataforma Abiertas: COUNT(*) FROM incidencias WHERE tipo = 'plataforma' AND estado = 'abierto'.

Contratos Próximos a Vencer: COUNT(*) FROM contratos WHERE fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '30 days'.

2.2. Gestión de Solicitudes y Contratos:

El Dueño ve la lista de solicitudes pendientes. Al abrir una, ve todos los datos y los archivos adjuntos.

Si aprueba, se inicia un proceso transaccional:

Crea una entrada en licencias y contratos.

Crea una entrada en edificios, vinculándola al nuevo contrato.

Crea una entrada en usuarios para el administrador (estado 'invitado').

Crea una entrada en afiliaciones vinculando al nuevo usuario con el nuevo edificio con el rol 'administrador'.

Dispara el email de invitación con token.

Cambia el estado de la solicitud a 'aprobado'.

2.3. Finanzas SaaS: Visualiza gráficas generadas por endpoints de agregación que consultan las tablas contratos y pagos (tipo_pago = 'licencia_saas').

2.4. Conciliación de Pagos de Licencia: El Dueño sube el estado de cuenta de LifeBit. El backend parsea el archivo y ejecuta el ServicioDeConciliacion para hacer match con los pagos reportados por los administradores y actualizar el estado de los contratos.

2.5. Comunicación Global (Noticias y Encuestas): Crea contenido que puede ser dirigido a todos los edificios o a un subconjunto, creando registros en las tablas noticias o consultas_populares y sus correspondientes tablas de audiencia.

2.6. Soporte y Auditoría:

Incidencias: Visualiza y gestiona los tickets creados por administradores (tipo = 'plataforma').

SQL Runner: La interfaz de "Soporte" envía texto SQL crudo a un endpoint ultra-protegido. Cada ejecución se registra inmutablemente en la tabla auditoria.

Parte 3: Panel del Administrador de Condominio

Propósito General: Gestión operativa completa de un condominio. Todas las acciones están contextualizadas al id_edificio seleccionado.

3.1. Onboarding y Gestión de Residentes:

Usa el formulario de "Registro Manual" o la herramienta de "Carga Masiva" (subiendo un CSV).

Ambas acciones llaman a endpoints que ejecutan el flujo de invitación de residentes: crean usuarios en estado 'invitado' con un token de registro y disparan el email de invitación.

3.2. Ciclo Financiero del Condominio:

Registro de Gastos: El admin crea registros en la tabla gastos durante todo el mes.

Generación de Recibos: Al final del mes, el admin acciona el endpoint "Generar Recibos". El backend:

Crea un recibos_maestro para el mes/año/edificio.

Calcula el total de gastos y busca multas/cargos de reservas pendientes.

Itera sobre cada unidad del edificio.

Calcula la deuda de cada unidad (basado en alícuota y cargos extra).

Crea una entrada en recibos_unidad y múltiples entradas en detalles_recibo para cada una.

Todo esto ocurre dentro de una transacción de base de datos.

Conciliación de Pagos de Residentes: El admin visualiza los pagos reportados por los residentes (estado 'en_verificacion'). Sube el estado de cuenta del condominio. El sistema hace el "match" y actualiza el estado_pago y saldo_restante en recibos_unidad.

3.3. Motor de Reglas:

El admin usa una interfaz drag-and-drop para construir una estructura JSON que se guarda en la tabla reglas.

Ejemplo de Ejecución: Cuando un residente solicita una reserva, el controlador de reservas, antes de aprobarla, llama al MotorDeReglasService. Este servicio busca todas las reglas activas para el evento_disparador = 'NUEVA_RESERVA'. Evalúa las condiciones de cada regla (ej. residente.deuda_total > 50) y si se cumplen, ejecuta las acciones correspondientes (ej. rechazar_reserva).

3.4. Gestión de la Comunidad (Noticias, Discusiones, Elecciones):

El admin actúa como creador y moderador. Todas las entidades que crea (noticias, discusiones_hilos, consultas_populares) se asocian automáticamente a su id_edificio.

El flujo de Elecciones implica la creación de una consulta_popular de tipo='eleccion', la gestión de opciones_consulta (los candidatos) y la activación de cron jobs para manejar los tiempos.

3.5. Traspaso de Poder: Después de una elección, el admin saliente puede ver los resultados. El Dueño de LifeBit es quien tiene el botón para ejecutar la acción de cambiar los roles en la tabla usuarios (o afiliaciones en V2).

Parte 4: Portal del Residente

Propósito General: Una interfaz clara y sencilla para que el residente interactúe con su comunidad y gestione sus responsabilidades.

4.1. Visualización de Información:

El Dashboard y las secciones Financiera y de Recibos llaman a endpoints que siempre filtran por el id_usuario o id_afiliacion del residente autenticado. El residente solo ve su propia información financiera.

Las secciones de Noticias, Discusiones y Votaciones llaman a endpoints que filtran por el id_edificio del residente para mostrarle solo el contenido relevante de su comunidad.

4.2. Flujo de Pago:

El residente ve su recibos_unidad con estado 'pendiente'.

Hace clic en "Pagar". La UI lo lleva al formulario de reporte de pago.

Rellena los datos de su transferencia y adjunta el comprobante.

Esto crea un registro en la tabla pagos con tipo_pago='condominio' y estado 'en_verificacion', lo que a su vez genera una notificación para el administrador.

4.3. Flujo de Reserva:

El residente interactúa con un calendario que obtiene la disponibilidad desde la API.

Al solicitar una reserva, se crea un registro en la tabla reservas con estado 'pendiente'.

El backend ejecuta el Motor de Reglas. Si la regla pasa, el estado de la reserva se actualiza a 'aprobada' y se notifica al residente. Si no, queda en 'pendiente' para revisión del admin.

4.4. Flujo de Participación (Elecciones/Votaciones):

El residente interactúa con la consulta_popular activa.

Puede postularse (crea una opciones_consulta de tipo candidato) o votar (crea una respuestas_consulta). La base de datos asegura (con un UNIQUE constraint) que solo pueda votar una vez por consulta.

Este documento ahora reside en mi memoria. Es el mapa conceptual más completo que hemos creado. Lo usaré como la referencia principal para guiar cada una de nuestras lecciones de codificación, asegurando que cada pieza que construyamos encaje perfectamente en esta gran visión.

Por favor, revisa si este desglose narrativo captura la esencia y los detalles de tu proyecto a tu entera satisfacción.
