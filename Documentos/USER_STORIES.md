# Historias de Usuario de LifeBit (Visión Completa del Producto)

Este documento describe las funcionalidades de LifeBit desde la perspectiva de sus usuarios. Utiliza el formato estándar: **COMO** [un tipo de usuario], **QUIERO** [realizar una acción], **PARA** [obtener un beneficio]. Sirve como la visión de producto que guía nuestro desarrollo técnico.

---
### **Épica 1: Onboarding, Autenticación y Gestión de Perfil**

#### **Visitante Anónimo / Cliente Potencial**
*   **COMO** un administrador de condominios que visita la web, **QUIERO** entender claramente los problemas que LifeBit resuelve y sus planes, **PARA** tomar una decisión de contratación informada.
*   **COMO** un visitante interesado, **QUIERO** solicitar el servicio a través de un formulario online, **PARA** iniciar el proceso de contratación de forma rápida.
*   **COMO** un usuario (invitado o activo) que llega a la página de login, **QUIERO** tener la opción de autenticarme usando mi cuenta de Google, **PARA** acceder a la plataforma sin necesidad de recordar una contraseña específica de LifeBit.
*   **COMO** un usuario que olvidó su contraseña, **QUIERO** solicitar un enlace de reseteo a mi correo, **PARA** recuperar el acceso a mi cuenta de forma segura.

#### **Usuario Invitado (Admin o Residente)**
*   **COMO** un usuario que recibió un email de invitación, **QUIERO** hacer clic en un enlace seguro y de tiempo limitado, **PARA** poder activar mi cuenta y establecer mi método de acceso.
*   **COMO** un usuario invitado, **QUIERO** poder elegir entre crear una contraseña tradicional o usar mi cuenta de Google para finalizar mi registro, **PARA** tener flexibilidad en cómo gestiono mi identidad digital.

#### **Cualquier Usuario Autenticado**
*   **COMO** un usuario autenticado, **QUIERO** poder cambiar mi contraseña actual desde mi perfil, **PARA** mantener la seguridad de mi cuenta.
*   **COMO** un usuario autenticado, **QUIERO** poder cerrar mi sesión de forma segura, **PARA** proteger mi cuenta en dispositivos compartidos.
*   **COMO** un usuario que se registró con contraseña, **QUIERO** poder vincular mi cuenta de Google desde mi perfil, **PARA** simplificar mis futuros inicios de sesión.
*   **COMO** un usuario, **QUIERO** poder desvincular mi cuenta de Google, **PARA** tener control total sobre mis métodos de autenticación.
*   **COMO** un usuario, **QUIERO** poder solicitar el cambio de mi dirección de email principal a través de un flujo de verificación seguro, **PARA** mantener mis datos de contacto actualizados.
*   **COMO** un usuario, **QUIERO** ver y actualizar mi información personal (nombre, teléfono), **PARA** asegurar que mis datos en la plataforma sean correctos.

#### **Dueño de la Aplicación (LifeBit Staff)**
*   **COMO** el Dueño de LifeBit, **QUIERO** recibir y listar las nuevas solicitudes de servicio, **PARA** gestionar el flujo de nuevos clientes.
*   **COMO** el Dueño de LifeBit, **QUIERO** aprobar una solicitud para que el sistema automáticamente cree el edificio, el contrato de prueba y envíe la invitación al administrador, **PARA** agilizar el onboarding.
*   **COMO** el Dueño de LifeBit, **QUIERO** tener una forma manual de crear un nuevo edificio y su administrador desde mi panel, **PARA** manejar clientes VIP o casos especiales.
*   **COMO** el Dueño de LifeBit, **QUIERO** un CRUD completo para gestionar las licencias (planes de servicio), **PARA** poder definir y modificar la oferta comercial de la plataforma.

#### **Administrador de Condominio**
*   **COMO** un administrador, **QUIERO** un asistente de configuración guiado en mi primer login, **PARA** asegurarme de configurar mi edificio correctamente y en el orden lógico.
*   **COMO** un administrador, **QUIERO** herramientas para generar masivamente la estructura de mi edificio (unidades, recursos, etc.), **PARA** ahorrar tiempo en la configuración inicial.
*   **COMO** un administrador, **QUIERO** poder invitar a nuevos residentes individualmente o de forma masiva (subiendo un archivo), **PARA** poblar mi comunidad de forma eficiente.
*   **COMO** un administrador, **QUIERO** un CRUD completo para gestionar a los residentes de mi edificio (ver, actualizar, suspender/activar), **PARA** mantener la lista de miembros de la comunidad al día.

---
### **Épica 2: El Núcleo Financiero**

#### **Administrador de Condominio**
*   **COMO** un administrador, **QUIERO** un lugar para registrar todas las cuentas bancarias del condominio, **PARA** que los residentes sepan dónde realizar sus pagos.
*   **COMO** un administrador, **QUIERO** poder registrar todos los gastos operativos del edificio a medida que ocurren, **PARA** mantener un registro transparente de las finanzas.
*   **COMO** un administrador, **QUIERO** poder generar el recibo de condominio mensual con un solo clic, **PARA** que el sistema calcule y distribuya automáticamente la deuda a cada unidad basándose en los gastos y las alícuotas.
*   **COMO** un administrador, **QUIERO** ver una lista de los pagos reportados por los residentes, **PARA** poder conciliarlos con mis estados de cuenta bancarios.
*   **COMO** un administrador, **QUIERO** poder aplicar multas a unidades específicas, **PARA** hacer cumplir las normativas del condominio.

#### **Residente**
*   **COMO** un residente, **QUIERO** poder ver mi estado de cuenta y el detalle de mis recibos de condominio de forma clara y transparente, **PARA** entender exactamente qué estoy pagando.
*   **COMO** un residente, **QUIERO** poder reportar un pago que he realizado y adjuntar el comprobante, **PARA** notificar al administrador y que mi deuda sea actualizada.

---
### **Épica 3: Comunidad, Participación y Servicios**

#### **Administrador de Condominio**
*   **COMO** un administrador, **QUIERO** publicar noticias y anuncios importantes para toda la comunidad, **PARA** mantener a todos informados de forma centralizada.
*   **COMO** un administrador, **QUIERO** crear y moderar un foro de discusiones, **PARA** fomentar la comunicación y resolver dudas comunes.
*   **COMO** un administrador, **QUIERO** crear encuestas y votaciones vinculantes, **PARA** tomar decisiones comunitarias de forma democrática y registrada.
*   **COMO** un administrador, **QUIERO** gestionar el proceso de elecciones de la junta de condominio, **PARA** garantizar un proceso transparente.
*   **COMO** un administrador, **QUIERO** definir las áreas comunes disponibles para reserva (ej. salón de fiestas) y sus reglas de uso, **PARA** gestionar su utilización.

#### **Residente**
*   **COMO** un residente, **QUIERO** leer las noticias y participar en las discusiones del foro, **PARA** estar conectado con mi comunidad.
*   **COMO** un residente, **QUIERO** participar en las encuestas y votar en las decisiones importantes, **PARA** ejercer mi derecho como miembro de la comunidad.
*   **COMO** un residente, **QUIERO** poder ver la disponibilidad de un área común y solicitar una reserva, **PARA** poder organizar eventos personales.

---
### **Épica 4: Automatización y Soporte**

#### **Administrador de Condominio**
*   **COMO** un administrador, **QUIERO** crear reglas de negocio simples (Evento-Condición-Acción), **PARA** automatizar tareas repetitivas como la aplicación de multas por pago tardío.
*   **COMO** un administrador, **QUIERO** un sistema para reportar incidencias o bugs de la plataforma LifeBit al equipo de soporte, **PARA** obtener ayuda cuando la necesite.

#### **Residente**
*   **COMO** un residente, **QUIERO** un sistema para reportar incidencias del condominio (ej. una fuga de agua) a mi administrador, **PARA** que los problemas se resuelvan eficientemente.
*   **COMO** un residente, **QUIERO** poder solicitar documentos formales (como una carta de solvencia) a través de la plataforma, **PARA** agilizar mis trámites personales.