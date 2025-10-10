/**
 * @file Este archivo centraliza funciones de utilidad puras y reutilizables
 * para el módulo de Residentes. Al mantenerlas aquí, promovemos el principio DRY (Don't Repeat Yourself)
 * y facilitamos las pruebas unitarias y la mantenibilidad del código.
 */

/**
 * @description Capitaliza la primera letra de cada palabra en una cadena de texto.
 * @param {string} texto - La cadena de texto a capitalizar.
 * @returns {string} El texto con cada palabra capitalizada.
 * @example capitalizarTexto("hola mundo") // Devuelve "Hola Mundo"
 */
export const capitalizarTexto = (texto) => {
    // Si el texto es nulo o no es una cadena, devuelve una cadena vacía para evitar errores.
    if (!texto || typeof texto !== 'string') return '';
    // Usa una expresión regular para encontrar el inicio de cada palabra (\b\w)
    // y convierte esa letra a mayúscula.
    return texto.replace(/\b\w/g, letra => letra.toUpperCase());
};

/**
 * @description Formatea un valor de texto al formato de cédula venezolana (ej. V12345678).
 * @param {string} valor - El valor de entrada del campo de cédula.
 * @returns {string} El valor formateado y limpiado.
 */
export const formatearCedula = (valor) => {
    // Si no hay valor, devuelve una cadena vacía.
    if (!valor) return '';
    // Convierte a mayúscula y remueve cualquier caracter que no sea V, E, J o un número.
    const limpio = valor.toUpperCase().replace(/[^VEJ0-9]/g, '');
    
    // Si ya tiene una letra de nacionalidad al inicio, la respeta y limita la longitud.
    if (limpio.match(/^[VEJ]/)) {
        return limpio.substring(0, 9); // Máximo 9 caracteres (V/E/J + 8 números).
    }
    // Si el usuario solo escribe números, se asume nacionalidad 'V' por defecto.
    if (limpio.match(/^\d/)) {
        return 'V' + limpio.substring(0, 8);
    }
    // Devuelve el valor limpio si no coincide con los casos anteriores (aunque es poco probable).
    return limpio.substring(0, 9);
};

/**
 * @description Formatea un valor de texto a un formato de teléfono venezolano (local o internacional).
 * @param {string} valor - El valor de entrada del campo de teléfono.
 * @returns {string} El valor del teléfono formateado.
 */
export const formatearTelefono = (valor) => {
    if (!valor) return '';
    // Remueve todos los caracteres que no sean dígitos o el símbolo '+'.
    const limpio = valor.replace(/[^\d+]/g, '');

    // Si comienza con '+', se trata como formato internacional (ej. +58...).
    if (limpio.startsWith('+')) {
        return limpio.substring(0, 13); // +58 y 10 dígitos.
    }
    // Si comienza con '0', se trata como formato local (ej. 0414...).
    if (limpio.startsWith('0')) {
        return limpio.substring(0, 11); // 0 y 10 dígitos.
    }
    // Si son solo números sin prefijo, se asume local y se agrega el '0' si falta.
    if (limpio.match(/^\d+$/)) {
        return limpio.startsWith('0') ? limpio.substring(0, 11) : ('0' + limpio).substring(0, 11);
    }
    // Caso por defecto para cualquier otra situación.
    return limpio.substring(0, 13);
};

/**
 * @description Genera la configuración de estilo para un badge de estado de residente.
 * @param {string} estado - El estado del residente ('activo', 'invitado', 'suspendido', etc.).
 * @returns {{color: string, texto: string, icono: string}} Objeto con clases de CSS, texto y clase de icono.
 */
export const getEstadoBadge = (estado) => {
    switch (estado) {
        case 'activo':
            return {
                color: 'bg-green-100 text-green-800 border-green-200',
                texto: 'Activo',
                icono: 'fas fa-check-circle'
            };
        case 'suspendido':
             return {
                color: 'bg-red-100 text-red-800 border-red-200',
                texto: 'Suspendido',
                icono: 'fas fa-user-slash'
            };
        case 'invitado':
        default: // 'pendiente' y cualquier otro estado se manejarán como el caso por defecto.
            return {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                texto: 'Pendiente',
                icono: 'fas fa-clock'
            };
    }
};

/**
 * @description Formatea una fecha a un formato de tiempo relativo (ej. "hace 5 minutos").
 * @param {Date | string} fecha - La fecha a formatear.
 * @returns {string} El tiempo relativo formateado o una cadena vacía si la fecha es inválida.
 */
export const formatearTiempoRelativo = (fecha) => {
    // Si no hay fecha, devuelve una cadena vacía.
    if (!fecha) return '';
    const fechaObj = new Date(fecha);

    const ahora = new Date();
    const diferencia = ahora - fechaObj; // Diferencia en milisegundos.
    
    // Convertir milisegundos a segundos, minutos y horas.
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    // Devolver la representación más apropiada.
    if (segundos < 60) return 'hace unos segundos';
    if (minutos < 60) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    
    // Si ha pasado más de un día, mostrar la fecha y hora locales.
    return fechaObj.toLocaleString();
};
