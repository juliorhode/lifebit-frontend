import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { FiCpu, FiUpload, FiEye, FiSearch } from 'react-icons/fi';
import AsignacionVisualPanel from './AsignacionVisualPanel';
import SearchBar from '../../../components/ui/SearchBar';

/**
 * @description Panel para gestionar el inventario de un tipo de recurso seleccionado.
 * Se comporta como un controlador de vistas, mostrando un estado de bienvenida, la tabla
 * de inventario, o el panel de asignación visual.
 * Utiliza `forwardRef` para exponer una función `refrescar` al componente padre.
 * 
 * @param {object} props - Props del componente.
 * @param {object|null} props.tipoSeleccionado - El objeto del tipo de recurso actualmente seleccionado.
 * @param {function} props.onGenerarClick - Callback para abrir el modal de generación de inventario.
 * @param {function} props.onCargarClick - Callback para abrir el modal de carga de archivo.
 * @param {React.Ref} ref - Referencia para exponer métodos al padre.
 */
const GestionInventarioPanel = forwardRef(({ tipoSeleccionado, onGenerarClick, onCargarClick }, ref) => {
    // --- ESTADO --- //

    /** @type {[Array<object>, function]} inventario - Almacena la lista de items del inventario para el tipo seleccionado. */
    const [inventario, setInventario] = useState([]);
    /** @type {[boolean, function]} isLoading - Controla el estado de carga al obtener el inventario. */
    const [isLoading, setIsLoading] = useState(false);
    /** @type {[string, function]} error - Almacena un mensaje de error si la carga del inventario falla. */
    const [error, setError] = useState('');
    /** @type {['tabla' | 'visual', function]} vistaActual - Controla qué vista se muestra: la tabla de inventario o el panel de asignación visual. */
    const [vistaActual, setVistaActual] = useState('tabla');
    /** @type {[string, function]} terminoBusqueda - Almacena el texto actual del campo de búsqueda para filtrar el inventario. */
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    // --- MANEJO DE DATOS Y EFECTOS --- //

    /**
     * @description Función reutilizable para obtener el inventario del tipo seleccionado desde la API.
     */
    const fetchInventario = async () => {
        if (!tipoSeleccionado?.id) {
            setInventario([]);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await apiService.get(`/admin/recursos/por-tipo/${tipoSeleccionado.id}`);
            setInventario(response.data.data.recursos);
        } catch (err) {
            setError('No se pudo cargar el inventario.');
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para cargar el inventario cada vez que el tipo de recurso seleccionado cambia.
    useEffect(() => {
        setVistaActual('tabla'); // Siempre volvemos a la vista de tabla por defecto al cambiar de recurso.
        setTerminoBusqueda(''); // Limpiamos la búsqueda al cambiar de tipo de recurso.
        fetchInventario();
    }, [tipoSeleccionado?.id]);

    /**
     * @description Expone la función `fetchInventario` al componente padre a través de la ref.
     * Esto permite que el padre (RecursosPage) pueda refrescar el inventario de este panel.
     */
    useImperativeHandle(ref, () => ({
        refrescar: fetchInventario
    }));

    // --- LÓGICA DE FILTRADO --- //

    /**
     * @description Filtra el inventario basado en el término de búsqueda.
     * La búsqueda no distingue mayúsculas/minúsculas y se aplica sobre el identificador único.
     */
    const inventarioFiltrado = inventario.filter(item =>
        item.identificador_unico.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );


    // --- RENDERIZADO CONDICIONAL DE VISTAS --- //

    // 1. Vista de bienvenida si no hay ningún tipo de recurso seleccionado.
    if (!tipoSeleccionado) {
        return (
            <div className={`${STYLES.card} h-full flex items-center justify-center text-center`}>
                <div className="text-gray-500">
                    <h2 className="text-xl font-semibold">Panel de Gestión de Inventario</h2>
                    <p className="mt-1">← Selecciona un tipo de recurso para comenzar.</p>
                </div>
            </div>
        );
    }

    // 2. Vista de asignación visual si el usuario ha hecho clic en "Gestionar Asignaciones".
    if (vistaActual === 'visual') {
        return (
            <AsignacionVisualPanel
                tipoRecurso={tipoSeleccionado}
                onGoBack={() => setVistaActual('tabla')}
                onSuccess={fetchInventario} // Se pasa `fetchInventario` para que el panel visual pueda refrescar la tabla al guardar.
            />
        );
    }

    // 3. Vista por defecto: la tabla de inventario.
    return (
        <div className={`${STYLES.card} h-full flex flex-col`}>
            {/* Cabecera del panel */}
            <h2 className={STYLES.titleSection}>Inventario de: <span className="text-blue-400">{tipoSeleccionado.nombre}</span></h2>

            {/* Barra de Búsqueda */}
            <SearchBar
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)} // Actualiza el estado del término de búsqueda
                placeholder='Buscar por identificador...' // Texto del placeholder
                className="flex-shrink-0"
            />

            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row gap-4 my-6">
                <button onClick={onGenerarClick} className={`${STYLES.buttonPrimary} w-full sm:w-auto flex-1`}>
                    <FiCpu className="mr-2" />
                    Generar Secuencialmente
                </button>
                <button onClick={onCargarClick} className={`${STYLES.buttonPrimaryAuto} w-full sm:w-auto flex-1`}>
                    <FiUpload className="mr-2" />
                    Cargar desde Archivo
                </button>
            </div>

            {/* Contenedor de la tabla de inventario */}
            <div className="border-t border-gray-700 pt-4 flex-grow flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-white">Inventario Actual ({inventarioFiltrado.length})</h3>
                    {inventarioFiltrado.length > 0 && (
                        <button onClick={() => setVistaActual('visual')} className={`${STYLES.buttonLink} flex items-center gap-1`}>
                            <FiEye /> Gestionar Asignaciones
                        </button>
                    )}
                </div>
                {/* La tabla en sí, con su propio scroll si es necesario */}
                <div className="flex-grow overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-gray-400">Cargando inventario...</p>
                        ) : error ? (
                            <p className={STYLES.errorText}>{error}</p>
                        ) : inventario.length > 0 ? (
                            inventarioFiltrado.length > 0 ? (
                                <table className="w-full text-left text-sm text-gray-300 table-fixed">
                                    <colgroup><col className="w-2/3" /><col className="w-1/3" /></colgroup>
                                    <thead className="border-b border-gray-700">
                                        <tr>
                                            <th className="py-2 px-2">Identificador</th>
                                            <th className="py-2 px-2">Propietario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventarioFiltrado.map(item => (
                                            <tr key={item.id} className="border-b border-gray-800">
                                                <td className="py-2 px-2 font-mono truncate">{item.identificador_unico}</td>
                                                <td className="py-2 px-2 truncate">{item.nombre_unidad_propietaria || <span className="text-gray-500">Sin Asignar</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No se encontraron resultados para "{terminoBusqueda}".</p>
                            )
                        ) : (
                            <p className="text-gray-400 text-center py-8">Aún no hay inventario para este tipo de recurso.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default GestionInventarioPanel;
