import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzone } from 'react-dropzone';
import { cargaInventarioSchema } from '../utils/recursos.schemas.js';
import apiService from '../../../services/apiService.js';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';
import Spinner from '../../../components/ui/Spinner';

/**
 * @description Componente modal para la carga masiva de inventario desde un archivo Excel.
 * Utiliza `react-dropzone` para una experiencia de "arrastrar y soltar" y `react-hook-form` con `yup`
 * para la validación del archivo antes de enviarlo al backend.
 * 
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSuccess - Callback que se ejecuta cuando el archivo se procesa exitosamente para refrescar la vista anterior.
 * @param {object} props.tipoRecurso - El tipo de recurso para el cual se está cargando el inventario.
 */
const CargarArchivoModal = ({ onClose, onSuccess, tipoRecurso }) => {
    // --- ESTADO INTERNO DEL MODAL ---

    /** @type {[boolean, function]} isProcessing - Controla el cambio de vista dentro del modal. `false` muestra el formulario, `true` muestra la vista de "procesando" y resultados. */
    const [isProcessing, setIsProcessing] = useState(false);
    /** @type {[object|null, function]} serverResult - Almacena la respuesta del backend (éxito o error) después de procesar el archivo para mostrarla al usuario. */
    const [serverResult, setServerResult] = useState(null);

    // --- CONFIGURACIÓN DE REACT-HOOK-FORM --- //
    const {
        handleSubmit, // Función de RHF que envuelve nuestro `onSubmit` y ejecuta la validación primero.
        setValue,     // Se usa para inyectar el archivo de dropzone en el estado del formulario.
        formState: { errors } // Objeto que contiene los errores de validación de Yup.
    } = useForm({
        resolver: yupResolver(cargaInventarioSchema), // Conecta Yup con React Hook Form.
    });

    // --- CONFIGURACIÓN DE REACT-DROPZONE --- //
    /**
     * @description Callback que se ejecuta cuando el usuario suelta o selecciona un archivo.
     * `useCallback` optimiza el rendimiento evitando que esta función se recree en cada render.
     */
    const onDrop = useCallback((acceptedFiles) => {
        // Inyecta el archivo en el campo 'archivoInventario' del formulario y dispara la validación.
        setValue('archivoInventario', acceptedFiles, { shouldValidate: true });
    }, [setValue]);

    // El hook `useDropzone` proporciona las propiedades y el estado necesarios para crear la zona de arrastre.
    const {
        getRootProps,   // Props para aplicar al div contenedor de la dropzone.
        getInputProps,  // Props para aplicar al input de archivo invisible.
        isDragActive,   // Booleano que es `true` cuando un archivo se está arrastrando sobre la zona.
        acceptedFiles,  // Array que contiene los archivos aceptados que el usuario ha seleccionado.
    } = useDropzone({
        onDrop,
        accept: { // Define explícitamente los tipos MIME de archivo aceptados.
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1, // Limita la carga a un solo archivo a la vez.
    });

    /** @type {string|undefined} fileName - El nombre del archivo seleccionado, para mostrarlo en la UI. */
    const fileName = acceptedFiles[0]?.name;

    // --- MANEJADOR DE ENVÍO --- //
    /**
     * @description Se ejecuta al enviar el formulario (si la validación de Yup es exitosa).
     * Construye el `FormData` y lo envía al backend.
     * @param {object} data - Los datos del formulario validados por RHF.
     */
    const onSubmit = async (data) => {
        setIsProcessing(true); // Cambia a la vista de "procesando".
        setServerResult(null); // Limpia resultados anteriores.

        const formData = new FormData();
        formData.append('idTipoRecurso', tipoRecurso.id);
        formData.append('archivoInventario', data.archivoInventario[0]);

        try {
            const response = await apiService.post('/admin/recursos/cargar-inventario', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setServerResult(response.data); // Guarda la respuesta de éxito.
        } catch (err) {
            // Manejo de errores para dar feedback claro al usuario.
            let friendlyErrorMessage = "Ha ocurrido un error inesperado al procesar el archivo.";
            const backendMessage = err.response?.data?.error?.mensaje || '';
            if (backendMessage.includes('uq_recursos_asignados_identificador')) {
                friendlyErrorMessage = "El archivo contiene identificadores que ya existen. Por favor, revísalo.";
            } else if (err.response?.data?.error?.mensaje) {
                friendlyErrorMessage = err.response.data.error.mensaje;
            }
            setServerResult({ error: friendlyErrorMessage }); // Guarda el error para mostrarlo.
        }
    };

    // --- RENDERIZADO DEL MODAL --- //
    return (
        <div>
            {!isProcessing ? (
                // --- VISTA 1: FORMULARIO DE CARGA ---
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h2 className={STYLES.titleSection}>Cargar Inventario para: <span className="text-blue-400">{tipoRecurso.nombre}</span></h2>
                    <p className="text-gray-400 mt-1 mb-6">
                        Sube un archivo Excel (.xlsx o .xls). Columnas requeridas: Recurso, Identificador, Propietario (Unidad).
                    </p>

                    {/* Contenedor de la zona para arrastrar y soltar archivos */}
                    <div
                        {...getRootProps()}
                        role="button"
                        tabIndex={0}
                        aria-label="Seleccionar archivo Excel para cargar inventario. Formatos aceptados: .xlsx o .xls"
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDragActive ? 'border-blue-500 bg-blue-900/50' : 'border-gray-600 hover:border-blue-500'}`}
                    >
                        {/* Input de archivo real, es invisible y controlado por react-dropzone */}
                        <input {...getInputProps()} aria-label="Archivo de inventario" />
                        <FiUploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                        <p className="font-semibold text-blue-400 mt-2">
                            Arrastra tu archivo aquí o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-gray-500">Solo archivos .xlsx o .xls, máximo 5MB</p>
                    </div>

                    {/* Muestra el nombre del archivo seleccionado y los errores de validación del formulario */}
                    {fileName && <p className="mt-2 text-sm text-gray-300 flex items-center justify-center"><FiFileText className="mr-2" />{fileName}</p>}
                    {errors.archivoInventario && <p className={`${STYLES.errorText} text-center mt-2`}>{errors.archivoInventario.message}</p>}

                    {/* Botones de acción del formulario */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className={STYLES.buttonSecondary}>Cancelar</button>
                        <button type="submit" className={STYLES.buttonPrimaryAuto}>Procesar Archivo</button>
                    </div>
                </form>
            ) : (
                // --- VISTA 2: PROCESAMIENTO Y RESULTADOS ---
                <div>
                    <h2 className={STYLES.titleSection}>Resultado de la Carga</h2>

                    {/* Muestra un spinner mientras se espera la respuesta del servidor */}
                    {!serverResult ? (
                        <div className="text-center py-8">
                            <Spinner />
                            <p className="mt-4 text-gray-400">Procesando archivo... No cierres esta ventana.</p>
                        </div>
                    ) : (
                        // Muestra el resultado cuando se recibe una respuesta del servidor.
                        <div>
                            {/* Caso de un error general de la API */}
                            {serverResult.error && (
                                <p className={STYLES.errorText}>{serverResult.error}</p>
                            )}

                            {/* Caso de una respuesta exitosa del backend */}
                            {serverResult.success && (
                                <div className="space-y-4 text-gray-300">
                                    <div className="text-lg p-4 bg-gray-800 rounded-md">
                                        <p>✅ <span className="font-bold">{serverResult.message}</span></p>
                                    </div>

                                    {/* Si el backend devuelve errores específicos por fila, se muestran aquí */}
                                    {serverResult.errores && serverResult.errores.length > 0 && (
                                        <div className="border-t border-gray-700 pt-3">
                                            <h4 className="font-semibold text-white mb-2">Detalle de Filas con Errores:</h4>
                                            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto bg-gray-800 p-3 rounded-md">
                                                {serverResult.errores.map((err, index) => (
                                                    <li key={index}>
                                                        <span className="font-bold text-red-400">Fila {err.fila}:</span>
                                                        <span className="ml-2 text-gray-400">{err.error}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* El botón de "Cerrar" finaliza el flujo y notifica al padre del éxito. */}
                            <div className="mt-6 text-right">
                                <button onClick={() => { onSuccess(); onClose(); }} className={STYLES.buttonPrimaryAuto}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CargarArchivoModal;
