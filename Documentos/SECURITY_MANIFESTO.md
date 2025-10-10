# Manifiesto de Seguridad de LifeBit (v1.0)

Este documento es la política de seguridad oficial y de cumplimiento obligatorio para el desarrollo de la plataforma LifeBit. Su propósito es establecer una base sólida de defensa en profundidad para proteger los datos de nuestros clientes y la integridad de nuestro sistema.

## Principio Fundamental: Confianza Cero (Zero Trust)

Nunca confiaremos implícitamente en ninguna petición, dato o usuario, incluso si ya está autenticado. Cada capa de la aplicación debe validar y verificar la información que recibe.

---
### 1. Autenticación y Gestión de Sesiones

**1.1. Contraseñas:**
*   **Almacenamiento:** Las contraseñas de los usuarios **NUNCA** deben ser almacenadas en texto plano o en un formato reversible. Se utilizará exclusivamente el algoritmo **bcrypt** con un factor de coste (`salt rounds`) de al menos 10.
*   **Transmisión:** Todas las rutas de autenticación deben operar exclusivamente sobre HTTPS en producción.
*   **Complejidad:** Se implementará una política de complejidad de contraseñas tanto en el frontend como en el backend (longitud mínima, variedad de caracteres).

**1.2. JSON Web Tokens (JWT):**
*   **`accessToken`:** Tendrá una vida útil corta (ej. **15 minutos**). Su `payload` contendrá la información mínima necesaria para la autorización y el contexto (`userId`, `rol`, `edificioId`).
*   **`refreshToken`:** Tendrá una vida útil larga (ej. **7 días**). Su único propósito es obtener un nuevo `accessToken`.
*   **Secretos:** Los secretos de firma (`JWT_SECRET`, `JWT_REFRESH_SECRET`) deben ser cadenas largas (256 bits o más) y criptográficamente seguras, almacenadas exclusivamente como variables de entorno.

**1.3. Protección de Tokens en el Cliente:**
*   El `accessToken` se almacenará en la memoria de la aplicación frontend (ej. Zustand), reconociendo que es accesible por JavaScript pero limitando el daño por su corta vida.
*   El `refreshToken` **DEBE** ser transmitido y almacenado en una **`HttpOnly`, `Secure` (en producción), y `SameSite=Strict` cookie**. Esta es nuestra principal defensa contra el robo de tokens por XSS.

**1.4. Prevención de Ataques de Fuerza Bruta:**
*   Los endpoints de autenticación (`/login`, `/forgot-password`) **DEBEN** estar protegidos por un middleware de **limitación de tasa (Rate Limiting)**. Se limitará el número de peticiones por IP y/o por cuenta en un periodo de tiempo determinado.
*   Se implementará un mecanismo de **bloqueo de cuenta** tras un número configurable de intentos de login fallidos, forzando al usuario a pasar por el flujo de "Olvidé mi contraseña".

---
### 2. Autorización y Control de Acceso

**2.1. Acceso Basado en Roles (RBAC):**
*   Toda ruta de API que exponga datos o permita acciones sensibles **DEBE** estar protegida por el middleware `protegeRuta` (autenticación) seguido del middleware `verificaRol` (autorización).
*   Los roles deben ser explícitos y seguir el principio de mínimo privilegio.

**2.2. Aislamiento de Datos (Tenant Isolation):**
*   **LA REGLA MÁS IMPORTANTE:** Toda consulta a la base de datos que lea, modifique o elimine datos pertenecientes a un edificio **DEBE** incluir una cláusula `WHERE` que filtre por el `id_edificio_actual` del usuario autenticado (`req.usuario.id_edificio_actual`).
*   Bajo ninguna circunstancia se debe confiar en un `id` de edificio enviado desde el cliente (body o params) como único filtro de seguridad. Siempre debe ser validado contra el `id` de la sesión del token.

---
### 3. Seguridad de la Aplicación y los Datos

**3.1. Validación de Entradas:**
*   El backend **NUNCA** debe confiar en la validación del frontend. Toda la data recibida en `req.body`, `req.params` y `req.query` debe ser rigurosamente validada en el controlador o en un middleware de validación (tipo, formato, longitud).

**3.2. Prevención de Inyección de SQL:**
*   Toda consulta a la base de datos se realizará utilizando **consultas parametrizadas** (placeholders `$1`, `$2`, etc.) a través del driver `pg` o de `pg-format`.
*   **NUNCA** se construirán consultas SQL concatenando strings directamente desde la entrada del usuario.

**3.3. Prevención de Cross-Site Scripting (XSS):**
*   **Salida Saneada:** El frontend tiene la responsabilidad principal, pero el backend actuará como segunda línea de defensa. Cualquier dato proveniente de un usuario que vaya a ser almacenado para ser renderizado como HTML (ej. contenido de un post del foro) **DEBE** ser saneado usando una librería como `sanitize-html` para eliminar scripts y tags peligrosos.
*   **Cabeceras de Seguridad:** La aplicación Express debe ser configurada (usando un middleware como `helmet`) para enviar cabeceras de seguridad HTTP que instruyan al navegador a mitigar ataques XSS y de otro tipo (ej. `Content-Security-Policy`, `X-Content-Type-Options`).

**3.4. Manejo de Archivos:**
*   **Validación de Tipo y Tamaño:** La subida de archivos (con `multer`) **DEBE** tener filtros estrictos de tipo de archivo (`fileFilter`) y límites de tamaño (`limits`) para prevenir ataques de denegación de servicio o la subida de archivos maliciosos.
*   **Almacenamiento:** En producción, los archivos se almacenarán en un servicio dedicado (AWS S3) y no en el sistema de archivos del servidor de la aplicación. El acceso a estos archivos se gestionará con URLs firmadas si se requiere privacidad.

---
### 4. Dependencias y Entorno

*   **Auditoría Regular:** Se ejecutará `npm audit` regularmente para detectar vulnerabilidades en las dependencias. No se introducirán nuevos paquetes con vulnerabilidades conocidas de alta o crítica severidad sin un plan de mitigación.
*   **Variables de Entorno:** Todas las credenciales, secretos y claves de API **DEBEN** ser gestionadas a través de variables de entorno y nunca deben ser "hardcodeadas" en el código fuente.