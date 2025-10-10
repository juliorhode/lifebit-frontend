import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { tipoRecursoSchema, toTitleCase } from '../utils/recursos.schemas.js';
import apiService from '../../../services/apiService.js';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Spinner from '../../../components/ui/Spinner';
import { toast } from 'react-hot-toast'; // Importamos toast

/**
 * @description Componente visual simple para mostrar una barra de progreso.
 * @param {{progress: number}} props - Props del componente.
 */
const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-4">
        <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

/**
 * @description Lista de sugerencias predefinidas para facilitar al usuario la creación de tipos de recurso comunes.
 */
const sugerencias = [
    { nombre: 'Estacionamiento', tipo: 'asignable' },
    { nombre: 'Maletero / Depósito', tipo: 'asignable' },
    { nombre: 'Control Remoto', tipo: 'asignable' },
    { nombre: 'Llave Magnética', tipo: 'asignable' },
    { nombre: 'Casillero', tipo: 'asignable' },
    { nombre: 'Bicicletero', tipo: 'asignable' },
    { nombre: 'Sala de Reuniones', tipo: 'asignable' },
    { nombre: 'Gimnasio', tipo: 'asignable' },
    { nombre: 'Lavandería', tipo: 'asignable' },
    { nombre: 'Piscina', tipo: 'asignable' },
    { nombre: 'Jardín', tipo: 'asignable' },
    { nombre: 'Ascensor', tipo: 'asignable' },
];

/**
 * @description Componente modal para la creación en lote de "Tipos de Recurso".
 * Permite al usuario añadir dinámicamente múltiples campos para crear varios tipos a la vez.
 * Muestra el progreso y resultado de la creación de cada tipo.
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onRecursosCreados - Callback que se ejecuta cuando el proceso de creación finaliza, para notificar al padre.
 */
const CrearTipoRecursoModal = ({ onClose, onRecursosCreados }) => {
    // --- ESTADO INTERNO ---
    /** @type {[boolean, function]} isProcessing - Controla el cambio de vista entre el formulario y la pantalla de progreso/resultados. */
    const [isProcessing, setIsProcessing] = useState(false);
    /** @type {[number, function]} progress - Almacena el porcentaje de progreso durante la creación en lote. */
    const [progress, setProgress] = useState(0);
    /** @type {[Array<object>, function]} results - Almacena los resultados (éxito/error) de cada intento de creación para mostrarlos al final. */
    const [results, setResults] = useState([]);
    /** @type {[boolean, function]} showAllSuggestions - Controla si mostrar todas las sugerencias o solo las principales. */
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    // --- REACT-HOOK-FORM SETUP ---
    const {
        register, // Función para registrar los inputs en el formulario.
        control,    // Objeto para conectar componentes de UI controlados (como `useFieldArray`).
        handleSubmit, // Envuelve el `onSubmit` para gestionar la validación.
        formState: { errors, isValid, isSubmitting }, // Contiene los errores de validación. isValid indica si el formulario es válido. isSubmitting indica si el formulario se está enviando.
        getValues,  // Función para obtener los valores actuales del formulario.
        setValue,   // Función para establecer valores en el formulario.
    } = useForm({
        resolver: yupResolver(tipoRecursoSchema), // Usa el esquema de Yup para la validación.
        defaultValues: { tipos: [{ nombre: '', tipo: 'asignable' }] }, // Inicia con un campo por defecto.
        mode: 'onChange' // Valida en cada cambio para feedback inmediato.
    });

    // `useFieldArray` proporciona la lógica para manipular campos de formulario dinámicos.
    const { fields, append, remove } = useFieldArray({ control, name: 'tipos' });

    // --- MANEJADORES ---
    /**
     * @description Se ejecuta al enviar el formulario. Itera sobre cada tipo de recurso y lo envía a la API uno por uno.
     * @param {object} data - Datos del formulario validados.
     */
    const onSubmit = async (data) => {
        setIsProcessing(true);
        const tiposACrear = data.tipos;
        let localResults = [];
        let huboErrores = false; // Flag para saber si mostramos un toast final de éxito o error
        
        // Itera sobre cada tipo y lo envía a la API.
        for (let i = 0; i < tiposACrear.length; i++) {
            const tipo = tiposACrear[i];
            try {
                await apiService.post('/admin/recursos/tipos', tipo);
                localResults.push({ name: tipo.nombre, status: 'success', message: 'Creado' });
            } catch (err) {
                huboErrores = true;
                const errorMessage = err.response?.data?.error?.mensaje || 'Error desconocido';
                if (errorMessage.includes('llave duplicada') || errorMessage.includes('unique constraint')) {
                    localResults.push({ name: tipo.nombre, status: 'error', message: 'Ya existe' });
                } else {
                    localResults.push({ name: tipo.nombre, status: 'error', message: 'Error' });
                }
                // localResults.push({ name: tipo.nombre, status: 'error', message: err.response?.data?.error?.mensaje || 'Error desconocido' });
            }
            // Actualiza el progreso y los resultados después de cada intento.
            setProgress(((i + 1) / tiposACrear.length) * 100);
            setResults([...localResults]);
        }
        // Muestra un toast final basado en si hubo errores o no.
        if (huboErrores) {
            toast.error("Algunos tipos no se pudieron crear.");
        } else {
            toast.success("Todos los tipos se crearon con éxito.");
        }

        // Llamamos a onRecursosCreados independientemente de si hubo errores,
        // para que la lista se refresque y el usuario vea lo que sí se creó.
        // onRecursosCreados();
    };

    /**
     * @description Maneja el clic en un botón de sugerencia. Si el último campo está vacío, lo rellena.
     * Si no, añade un nuevo campo con los datos de la sugerencia.
     * @param {object} sugerencia - El objeto de sugerencia con `nombre` y `tipo`.
     */
    const handleSugerenciaClick = (sugerencia) => {
        const currentTipos = getValues('tipos');
        const lastIndex = currentTipos.length - 1;
        // Revisa si el último campo está vacío para reutilizarlo.
        if (currentTipos.length > 0 && currentTipos[lastIndex].nombre.trim() === '') {
            setValue(`tipos.${lastIndex}.nombre`, sugerencia.nombre, { shouldValidate: true });
            setValue(`tipos.${lastIndex}.tipo`, sugerencia.tipo, { shouldValidate: true });
        } else {
            // Si no, añade un nuevo campo.
            append(sugerencia);
        }
    };

    

    /**
     * @description Se ejecuta cuando el usuario hace clic en el botón "Cerrar" final.
     * Primero notifica al padre para que refresque la lista de recursos,
     * y luego ejecuta el callback para cerrar el modal.
     */
    const handleCloseAndNotify = () => {
        onRecursosCreados(); // Refresca la lista en segundo plano.
        onClose();           // Cierra el modal.
    };

    // --- RENDERIZADO ---
    return (
        <div>
            {!isProcessing ? (
                // --- VISTA 1: FORMULARIO DE CREACIÓN ---
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Contenedor de campos dinámicos con scroll */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr_140px_auto] items-start gap-2">
                                {/* Input para el nombre del tipo de recurso */}
                                <div>
                                    <label htmlFor={`tipo-nombre-${index}`} className={STYLES.label}>Nombre del Recurso</label>
                                    <input {...register(`tipos.${index}.nombre`)}
                                        id={`tipo-nombre-${index}`}
                                        placeholder="Nombre del Recurso"
                                        onChange={(event) => {
                                            const capitalizedValue = toTitleCase(event.target.value);
                                            setValue(`tipos.${index}.nombre`, capitalizedValue, { shouldValidate: true });
                                        }}
                                        className={STYLES.input} />
                                    {errors.tipos?.[index]?.nombre && <p className={STYLES.errorText}>{errors.tipos[index].nombre.message}</p>}
                                </div>
                                {/* Selector para el tipo (asignable o inventario) */}
                                <div>
                                    <select {...register(`tipos.${index}.tipo`)} className={`${STYLES.input} mt-7`}>
                                        <option value="asignable">Asignable</option>
                                        <option value="inventario">Inventario</option>
                                    </select>
                                </div>
                                {/* Botón para eliminar un campo */}
                                <button type="button" onClick={() => remove(index)} aria-label="Eliminar tipo de recurso" className="p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 h-full flex items-center">
                                    <FiTrash2 aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.tipos && !Array.isArray(errors.tipos) && (
                        <p className={STYLES.errorText}>{errors.tipos.message}</p>
                    )}
                    
                    {/* Botón para añadir un nuevo campo vacío */}
                    <button type="button" onClick={() => append({ nombre: '', tipo: 'asignable' })} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                        <FiPlus /> Añadir otro tipo
                    </button>

                    {/* Sección de sugerencias */}
                    <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-3">O añade desde nuestras sugerencias:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(showAllSuggestions ? sugerencias : sugerencias.slice(0, 6)).map((sugerencia) => (
                                <button key={sugerencia.nombre} type="button" onClick={() => handleSugerenciaClick(sugerencia)} className="w-full h-full px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm hover:bg-blue-600 hover:text-gray-700 dark:text-white transition-colors text-center">
                                    {sugerencia.nombre}
                                </button>
                            ))}
                        </div>
                        {sugerencias.length > 6 && (
                            <div className="mt-3 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                                    className={`${STYLES.buttonLink} text-sm`}
                                >
                                    {showAllSuggestions ? 'Ver menos' : `Ver ${sugerencias.length - 6} más`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botón de envío principal */}
                    <div className="pt-4">
                        {/* El botón se deshabilita si el formulario no es válido o si ya se está enviando. */}
                        <button type="submit" disabled={!isValid || isSubmitting}  className={STYLES.buttonPrimary}>Crear Tipos</button>
                    </div>
                </form>
            ) : (
                // --- VISTA 2: PANTALLA DE PROGRESO Y RESULTADOS ---
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-white text-center">Procesando...</h4>
                    <ProgressBar progress={progress} />
                    {/* Lista de resultados de la creación en lote */}
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {results.map((result, index) => (
                            <li key={index} className={`flex items-center text-sm ${result.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {result.status === 'success' ? '✅' : '❌'}
                                <span className="ml-2 font-semibold">{result.name}:</span>
                                <span className="ml-1">{result.message}</span>
                            </li>
                        ))}
                    </ul>
                    {/* El botón de cerrar solo aparece cuando el proceso ha finalizado (progreso al 100%) */}
                    {progress === 100 && (
                            <div className="mt-6 flex justify-center">
                                <button onClick={handleCloseAndNotify} className={`${STYLES.buttonPrimaryAuto}`}>Cerrar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CrearTipoRecursoModal;
