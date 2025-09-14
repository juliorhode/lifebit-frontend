import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../../../services/apiService';

/**
 * @description Modal para invitación masiva de residentes mediante archivo Excel
 * Permite subir archivo, validar formato y procesar múltiples invitaciones
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función llamada cuando las invitaciones son procesadas
 * @returns {JSX.Element} Modal de invitación masiva
 */
const InvitarResidentesMasivoModal = ({ onClose, onSuccess }) => {
    // STATE: Gestión del estado del componente
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [resultados, setResultados] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef();

    // Determinar el título basado en el estado
    const modalTitle = resultados ? "Resultados de la Carga Masiva" : "Invitar Residentes Masivamente";
    /**
     * @description Valida y establece un archivo seleccionado
     * @param {File} file - Archivo a validar y seleccionar
     */
    const validateAndSetFile = (file) => {
        // VALIDACIÓN: Verificar tipo de archivo (solo Excel según backend)
        const allowedExtensions = ['.xlsx', '.xls'];
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        const hasValidMime = allowedMimes.includes(file.type);

        if (!hasValidExtension || !hasValidMime) {
            toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
            return;
        }

        // VALIDACIÓN: Verificar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no puede superar los 10MB');
            return;
        }

        setSelectedFile(file);
        setResultados(null); // Limpiar resultados anteriores
    };

    /**
     * @description Maneja la selección de archivo desde input
     * @param {Event} event - Evento del input file
     */
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    /**
     * @description Maneja el drag over del archivo
     * @param {Event} e - Evento de drag
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    /**
     * @description Maneja el drag leave del archivo
     * @param {Event} e - Evento de drag
     */
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    /**
     * @description Maneja el drop del archivo
     * @param {Event} e - Evento de drop
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    /**
     * @description Maneja la subida y procesamiento del archivo Excel
     */
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Selecciona un archivo primero');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // API CALL: Usar endpoint existente para invitación masiva
            const formData = new FormData();
            formData.append('archivoInventario', selectedFile);

            const response = await apiService.post('/admin/invitaciones/residentes-masivo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // PROCESAR RESULTADOS: Adaptar a la nueva estructura del backend
            const backendResponse = response.data;

            // Extraer datos de la respuesta
            const data = backendResponse.data || {};
            const procesados = (data.invitacionesEncoladas || 0) + (data.invitacionesFallidas || 0);
            const exitosos = data.invitacionesEncoladas || 0;
            const errores = data.errores || [];

            setResultados({
                procesados,
                exitosos,
                errores
            });

            // Los resultados se mostrarán en el modal, no necesitamos toasts adicionales
            // El callback se llamará cuando el usuario cierre el modal manualmente

        } catch (error) {
            console.error('Error en invitación masiva:', error);

            // MANEJO DE ERRORES: Mensajes específicos
            if (error.response?.status === 400) {
                toast.error('Formato de archivo inválido. Revisa la plantilla');
            } else if (error.response?.status === 413) {
                toast.error('Archivo demasiado grande');
            } else {
                toast.error('Error al procesar el archivo. Inténtalo de nuevo');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * @description Descarga la plantilla CSV de ejemplo para invitación masiva
     */
    const handleDescargarPlantilla = () => {
        try {
            // PLANTILLA: Crear contenido CSV con ejemplos ficticios
            const csvContent = [
                // Encabezados exactos que espera el backend
                'Nombre,Apellido,Email,Telefono (Opcional),Cedula (Opcional),Unidad Asignada',
                // Ejemplos de datos completamente ficticios
                'Juan, Silva, juan.silva@example.com,04141234567, V12345678, 4a',
                'Maria, Rodriguez, maria.rodriguez@example.com,02121234567, V89012345, 4b',
                'Carlos, Lopez, carlos.lopez@example.com,04121234567, E67890123, 3a',
                'Ana, Garcia, ana.garcia@example.com,04161234567, J45678901, 1a',
                'Pedro, Marinez, pedro.martinez@example.com,04241234567, V23456789, 2b'
            ].join('\n');

            // Crear blob y descargar (como CSV que se puede abrir en Excel)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'plantilla_residentes.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            toast.success('Plantilla descargada exitosamente');
        } catch (error) {
            console.error('Error al descargar plantilla:', error);
            toast.error('Error al descargar la plantilla');
        }
    };

    /**
     * @description Reinicia el modal a su estado inicial
     */
    const handleReiniciar = () => {
        setSelectedFile(null);
        setResultados(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER: Título y descripción */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Invitar Residentes Masivamente
                </h3>
                <p className="text-gray-400 text-sm">
                    Sube un archivo Excel con la lista de residentes para enviar invitaciones automáticamente.
                </p>
            </div>


            {/* UPLOAD AREA: Selección de archivo con drag & drop */}
            {!resultados && (
                <div className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                            isDragOver
                                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                                : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div>
                                <i className="fas fa-file-excel text-green-400 text-3xl mb-3"></i>
                                <p className="text-white font-medium">{selectedFile.name}</p>
                                <p className="text-gray-400 text-sm">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <i className={`fas ${isDragOver ? 'fa-cloud-upload-alt text-blue-400' : 'fa-cloud-upload-alt text-gray-400'} text-3xl mb-3`}></i>
                                <p className="text-white font-medium mb-2">
                                    {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
                                </p>
                                <p className="text-gray-400 text-sm mb-4">o</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    <i className="fas fa-folder-open mr-2"></i>
                                    Seleccionar archivo
                                </button>
                                <p className="text-gray-500 text-xs mt-3">
                                    Formatos soportados: .xlsx, .xls (máx. 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* PLANTILLA: Descarga de plantilla Excel */}
                    <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
                        <div className="text-center">
                            <button
                                onClick={handleDescargarPlantilla}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center mx-auto"
                            >
                                <i className="fas fa-download mr-2"></i>
                                Descargar Plantilla Excel
                            </button>
                            <p className="text-blue-200 text-xs mt-2">
                                Descarga el archivo, ábrelo en Excel y guárdalo como .xlsx antes de subirlo
                            </p>
                        </div>
                    </div>

                    {/* ACCIONES: Botones de upload */}
                    {selectedFile && (
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-50 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Procesando... {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-upload mr-2"></i>
                                        Procesar Archivo
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleReiniciar}
                                disabled={isUploading}
                                className="w-50 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            >
                                <i className="fas fa-redo mr-2"></i>
                                Reiniciar
                            </button>
                        </div>
                    )}

                    {/* PROGRESS BAR: Durante el upload */}
                    {isUploading && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            )}

            {/* RESULTADOS: Mostrar estadísticas del procesamiento */}
            {resultados && (
                <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Resultados del procesamiento</h4>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-900 bg-opacity-50 rounded p-3">
                                <div className="text-2xl font-bold text-blue-300">{resultados.procesados}</div>
                                <div className="text-sm text-blue-200">Procesados</div>
                            </div>

                            <div className="bg-green-900 bg-opacity-50 rounded p-3">
                                <div className="text-2xl font-bold text-green-300">{resultados.exitosos}</div>
                                <div className="text-sm text-green-200">Exitosos</div>
                            </div>

                            <div className="bg-red-900 bg-opacity-50 rounded p-3">
                                <div className="text-2xl font-bold text-red-300">{resultados.errores?.length || 0}</div>
                                <div className="text-sm text-red-200">Errores</div>
                            </div>
                        </div>

                        {/* DETALLE DE ERRORES: Si existen */}
                        {resultados.errores && resultados.errores.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-red-300 font-medium mb-2">Errores encontrados:</h5>
                                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded p-3 max-h-30 overflow-y-auto">
                                    <ul className="text-sm text-red-200 space-y-1">
                                        {resultados.errores.map((error, index) => (
                                            <li key={index}>
                                                • Fila {error.fila}: {error.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACCIONES POST-PROCESAMIENTO */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleReiniciar}
                            className="w-53 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Procesar Otro Archivo
                        </button>

                        <button
                            onClick={() => {
                                // Notificar al componente padre sobre los resultados antes de cerrar
                                if (onSuccess && resultados) {
                                    onSuccess({ exitosos: resultados.exitosos, errores: resultados.errores });
                                }
                                onClose();
                            }}
                            className="w-53 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            <i className="fas fa-check mr-2"></i>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitarResidentesMasivoModal;