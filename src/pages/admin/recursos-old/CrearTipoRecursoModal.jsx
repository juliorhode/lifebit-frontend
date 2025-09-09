import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { tipoRecursoSchema } from '../../../utils/validationSchemas.jsx';
import apiService from '../../../services/apiService.js';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

/**
 * @description Componente interno para mostrar una barra de progreso visual.
 * Es un componente "tonto" que solo recibe un valor de progreso.
 * @param {{ progress: number }} props
 */
const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5 my-4">
        <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

/**
 * @description Lista de sugerencias de tipos de recurso comunes para facilitar la creación.
 * @type {Array<{nombre: string, tipo: 'asignable'|'inventario'}>}
 */
const sugerencias = [
    { nombre: 'Estacionamiento', tipo: 'asignable' },
    { nombre: 'Control Remoto', tipo: 'asignable' },
    { nombre: 'Bicicletero', tipo: 'asignable' },
    { nombre: 'Maletero / Depósito', tipo: 'asignable' },
    { nombre: 'Llave Magnética', tipo: 'asignable' },
    { nombre: 'Casillero', tipo: 'asignable' },
];

/**
 * @description Un modal para la creación en lote de "Tipos de Recurso".
 * Contiene un formulario dinámico y gestiona el proceso de envío en lote,
 * mostrando el progreso y los resultados en tiempo real.
 * 
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onRecursosCreados - Callback a ejecutar cuando el proceso finaliza, para refrescar la lista.
 */
const CrearTipoRecursoModal = ({ onClose, onRecursosCreados }) => {
    // --- ESTADO INTERNO DEL COMPONENTE ---

    // `isProcessing` controla qué vista mostramos: el formulario o la pantalla de progreso.
    const [isProcessing, setIsProcessing] = useState(false);
    // `progress` almacena el porcentaje de avance (0-100) para la barra de progreso.
    const [progress, setProgress] = useState(0);
    // `results` almacena los resultados individuales de cada llamada a la API.
    const [results, setResults] = useState([]);

    // --- CONFIGURACIÓN DE REACT HOOK FORM ---

    const {
        register,   // Función para registrar los inputs.
        control,    // Objeto para conectar componentes a RHF (necesario para useFieldArray).
        handleSubmit, // Envuelve nuestro onSubmit, ejecutándolo solo si la validación pasa.
        formState: { errors } // Objeto que contiene todos los errores de validación.
    } = useForm({
        // Conectamos RHF con nuestro esquema de Yup para la validación.
        resolver: yupResolver(tipoRecursoSchema),
        // Estado inicial del formulario: empezamos con una fila en blanco.
        defaultValues: {
            tipos: [{ nombre: '', tipo: 'asignable' }],
        },
    });

    // `useFieldArray` es el hook de RHF para manejar campos de formulario dinámicos (listas).
    const { fields, append, remove } = useFieldArray({
        control, // Le decimos a qué formulario pertenece.
        name: 'tipos', // El nombre del campo en nuestro schema que es un array.
    });

    /**
     * @description Función que se ejecuta al enviar un formulario válido.
     * Itera sobre los datos del formulario y realiza una llamada a la API por cada uno,
     * manejando el progreso y los errores de forma individual.
     * @param {object} data - Los datos del formulario validados por Yup.
     */
    const onSubmit = async (data) => {
        // 1. Cambiamos al modo de "procesamiento" para mostrar la barra de progreso.
        setIsProcessing(true);
        const tiposACrear = data.tipos;
        let localResults = []; // Un array temporal para ir guardando los resultados.

        // 2. Usamos un bucle `for...of` para iterar secuencialmente y tener control total.
        for (let i = 0; i < tiposACrear.length; i++) {
            const tipo = tiposACrear[i];
            try {
                // 3. INTENTAMOS crear el recurso.
                await apiService.post('/admin/recursos/tipos', tipo);
                localResults.push({ name: tipo.nombre, status: 'success', message: 'Creado' });
            } catch (err) {
                // 4. SI FALLA, capturamos el error pero NO detenemos el bucle.
                localResults.push({ name: tipo.nombre, status: 'error', message: err.response?.data?.error?.mensaje || 'Error desconocido' });
            }
            // 5. ACTUALIZAMOS la UI después de cada intento.
            // Calculamos el nuevo progreso.
            const newProgress = ((i + 1) / tiposACrear.length) * 100;
            setProgress(newProgress);
            // Actualizamos la lista de resultados para que el usuario la vea en tiempo real.
            setResults([...localResults]);
        }

        // 6. Al finalizar el bucle, notificamos a la página padre que debe refrescar sus datos.
        onRecursosCreados();
    };

    /**
     * @description Manejador para los botones de sugerencia.
     * Añade una nueva fila al formulario con los datos de la sugerencia seleccionada.
     * @param {{nombre: string, tipo: string}} sugerencia - El objeto de la sugerencia.
     */
    const handleSugerenciaClick = (sugerencia) => {
        // `append` es la función de useFieldArray para añadir un nuevo elemento.
        append(sugerencia);
    };

    return (
        <div>
            {!isProcessing ? (
                // --- VISTA 1: EL FORMULARIO ---
                // Se muestra mientras el usuario está rellenando los datos.
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* 
                      Contenedor para las filas dinámicas.
                      - `space-y-3`: Añade un espacio vertical consistente entre cada fila.
                      - `max-h-60 overflow-y-auto pr-2`: Si se añaden muchas filas,
                        este contenedor tendrá una altura máxima y mostrará una barra de scroll interna,
                        evitando que el modal crezca indefinidamente.
                    */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {fields.map((field, index) => (
                            /**
                             * --- FILA INDIVIDUAL (Layout con CSS Grid) ---
                             * Usamos CSS Grid aquí para un control perfecto de las columnas.
                             * - `grid`: Activa el layout de cuadrícula.
                             * - `grid-cols-[1fr_auto_auto]`: Define 3 columnas:
                             *   - `1fr`: La primera columna (el input de texto) es flexible y ocupará
                             *            todo el espacio sobrante. 'fr' significa 'fracción'.
                             *   - `auto`: La segunda (el select) y tercera (el botón) columna ocuparán
                             *             automáticamente solo el espacio que su contenido necesite.
                             * - `items-start`: Alinea los elementos en la parte superior de la celda.
                             * - `gap-2`: Añade un pequeño espacio entre las columnas.
                             */
                            <div key={field.id} className="grid grid-cols-[1fr_140px_auto] items-start gap-2">

                                {/* Columna 1: Input (se estira) */}
                                <div>
                                    <input {...register(`tipos.${index}.nombre`)} placeholder="Nombre del Recurso" className={STYLES.input} />
                                    {errors.tipos?.[index]?.nombre && <p className={STYLES.errorText}>{errors.tipos[index].nombre.message}</p>}
                                </div>

                                {/* Columna 2: Select (ancho automático) */}
                                <div>
                                    <select {...register(`tipos.${index}.tipo`)} className={STYLES.input }>
                                        <option value="asignable">Asignable</option>
                                        <option value="inventario">Inventario</option>
                                    </select>
                                </div>

                                {/* Columna 3: Botón (ancho automático) */}
                                <button type="button" onClick={() => remove(index)} className="p-3 text-gray-400 hover:text-red-500 h-full flex items-center">
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Mensaje de error general para el array (ej. si está vacío). */}
                    {errors.tipos && <p className={STYLES.errorText}>{errors.tipos.message}</p>}

                    {/* Botón para añadir una nueva fila al formulario dinámico. */}
                    <button type="button" onClick={() => append({ nombre: '', tipo: 'asignable' })} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                        <FiPlus /> Añadir otro tipo
                    </button>

                    {/* --- SECCIÓN DE SUGERENCIAS --- */}
                    <div className="pt-4 border-t border-gray-700">
                        <h4 className="font-semibold text-gray-300 mb-3">O añade desde nuestras sugerencias:</h4>
                        {/**
                         * Usamos CSS Grid para asegurar que los botones sean proporcionales.
                         * - `grid-cols-2`: En móvil, crea una cuadrícula estricta de 2 columnas.
                         * - `sm:grid-cols-3`: En pantallas más grandes, cambia a 3 columnas.
                         * - `gap-2`: Espacio uniforme entre los botones.
                         */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {sugerencias.map((sugerencia) => (
                                <button
                                    key={sugerencia.nombre}
                                    type="button"
                                    onClick={() => handleSugerenciaClick(sugerencia)}
                                    // `w-full h-full` fuerza al botón a ocupar toda la celda de la cuadrícula,
                                    // garantizando que todos tengan el mismo tamaño.
                                    className="w-full h-full px-3 py-2 bg-gray-700 text-gray-200 rounded-md text-sm hover:bg-blue-600 hover:text-white transition-colors text-center"
                                >
                                    {sugerencia.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenedor para el botón de envío principal. */}
                    <div className="pt-4">
                        <button type="submit" className={STYLES.buttonPrimary}>
                            Crear Tipos
                        </button>
                    </div>
                </form>
            ) : (
                // --- VISTA 2: LA PANTALLA DE PROGRESO (sin cambios) ---
                <div>
                    <h4 className="font-semibold text-white text-center">Procesando...</h4>
                    <ProgressBar progress={progress} />
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {results.map((result, index) => (
                            <li key={index} className={`flex items-center text-sm ${result.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {result.status === 'success' ? '✅' : '❌'}
                                <span className="ml-2 font-semibold">{result.name}:</span>
                                <span className="ml-1">{result.message}</span>
                            </li>
                        ))}
                    </ul>
                    {progress === 100 && (
                        <div className="mt-6 text-center">
                            <button onClick={onClose} className={`${STYLES.buttonPrimaryAuto}`}>
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CrearTipoRecursoModal;