import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DndContext, closestCenter, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Container from '../../../components/dnd/Container';
import Item from '../../../components/dnd/Item';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { generateExamples } from '../utils/recursos.utils.js';
import { generadorInventarioSchema } from '../utils/recursos.schemas.js';
import { FiMove } from 'react-icons/fi';
import Spinner from '../../../components/ui/Spinner';
import apiService from '../../../services/apiService.js';

// --- DEFINICIÓN DE BLOQUES DISPONIBLES ---

/** @description Bloques que representan contadores con diferente formato (padding de ceros). */
const bloquesContador = [
    { id: '{c}', text: () => `Contador (1)`, category: 'contador' },
    { id: '{c_c}', text: () => `Contador (01)`, category: 'contador' },
    { id: '{C}', text: () => `Contador (001)`, category: 'contador' },
];
/** @description Bloque especial que permite al usuario insertar texto fijo personalizado. */
const bloquesTexto = [{ id: 'custom_text', text: () => 'Texto Libre', category: 'texto' }];
/** @description Lista completa de todos los bloques disponibles para la paleta inicial. */
const listaCompletaDeBloques = [...bloquesContador, ...bloquesTexto];

/**
 * @description Modal que contiene la herramienta para generar inventario secuencial mediante un constructor de patrones de arrastrar y soltar.
 * @param {object} props
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSuccess - Callback a ejecutar cuando el inventario se genera exitosamente.
 * @param {object} props.tipoRecurso - El tipo de recurso para el cual se va a generar el inventario.
 */
const GeneradorInventarioModal = ({ onClose, onSuccess, tipoRecurso }) => {
    // --- ESTADO DEL COMPONENTE ---

    /** @type {[Array<object>, function]} paletteItems - Items actualmente disponibles en la paleta para ser arrastrados. */
    const [paletteItems, setPaletteItems] = useState(listaCompletaDeBloques);
    /** @type {[Array<object>, function]} canvasItems - Items que el usuario ha arrastrado al canvas para construir el patrón. */
    const [canvasItems, setCanvasItems] = useState([]);
    /** @type {[object|null, function]} activeItem - El item que se está arrastrando actualmente. Necesario para el `DragOverlay`. */
    const [activeItem, setActiveItem] = useState(null);
    /** @type {[Array<string>, function]} preview - Almacena los ejemplos de nombres generados para la previsualización. */
    const [preview, setPreview] = useState([]);
    /** @type {[string, function]} serverError - Almacena mensajes de error provenientes del backend durante el envío. */
    const [serverError, setServerError] = useState('');

    // --- REACT-HOOK-FORM SETUP ---
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(generadorInventarioSchema),
        defaultValues: { cantidad: 10, numeroInicio: 1 },
    });

    // `watch` nos permite reaccionar a cambios en los inputs del formulario para actualizar la previsualización en tiempo real.
    const cantidad = watch('cantidad');
    const numeroInicio = watch('numeroInicio');

    // --- LÓGICA DE PREVISUALIZACIÓN ---
    /**
     * @description Efecto que se ejecuta cada vez que cambia el patrón (canvasItems) o los parámetros (cantidad, numeroInicio).
     * Genera una lista de ejemplos y la guarda en el estado `preview`.
     */
    useEffect(() => {
        const pattern = canvasItems.map(item => item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0]).join('');
        const examples = generateExamples(pattern, cantidad, numeroInicio);
        setPreview(examples);
    }, [canvasItems, cantidad, numeroInicio]);

    // --- MANEJADORES DE DND-KIT ---

    /** @description Se activa cuando un usuario empieza a arrastrar un item. Guarda el item activo en el estado. */
    const handleDragStart = (event) => {
        const { active } = event;
        const allItems = [...paletteItems, ...canvasItems];
        let item = allItems.find(i => i.id === active.id);
        if (item) {
            // Si el texto es una función (como en la paleta), la ejecutamos para obtener el string.
            if (typeof item.text === 'function') {
                item = { ...item, text: item.text() };
            }
            setActiveItem(item);
        }
    };

    /** @description Se activa cuando el usuario suelta un item. Contiene la lógica principal de drag and drop. */
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveItem(null);
        if (!over) return;

        const isFromPalette = paletteItems.some(i => i.id === active.id);
        const isFromCanvas = canvasItems.some(i => i.id === active.id);

        // CASO 1: Mover un item desde la PALETA al CANVAS.
        if (isFromPalette && (over.id === 'canvas' || canvasItems.some(i => i.id === over.id))) {
            let itemToMove = paletteItems.find(i => i.id === active.id);
            let materializedText = typeof itemToMove.text === 'function' ? itemToMove.text() : itemToMove.text;

            // Si es un bloque de texto custom, pedimos al usuario que ingrese el texto.
            if (itemToMove.id === 'custom_text') {
                const userText = prompt('Ingresa el texto fijo (ej: "-", "S","Torre A " etc):');
                if (!userText) return; // Si el usuario cancela, no hacemos nada.
                materializedText = userText.toUpperCase();
                // Añadimos al canvas con un ID único basado en la fecha.
                setCanvasItems(prev => [...prev, { ...itemToMove, text: materializedText, id: `custom_text-${Date.now()}` }]);
            } else {
                // Si es un contador, lo movemos de la paleta al canvas.
                setPaletteItems(prev => prev.filter(i => i.id !== activeId));
                setCanvasItems(prev => [...prev, { ...itemToMove, text: materializedText, id: `${itemToMove.id}-${Date.now()}` }]);
            }
        // CASO 2: Devolver un item desde el CANVAS a la PALETA.
        } else if (isFromCanvas && over.id === 'palette') {
            const itemToMove = canvasItems.find(i => i.id === activeId);
            setCanvasItems(prev => prev.filter(i => i.id !== activeId));
            const originalId = itemToMove.id.split('-')[0];
            const originalItem = listaCompletaDeBloques.find(b => b.id === originalId);
            // Solo devolvemos a la paleta si no es un texto custom (esos se pueden recrear).
            if (originalItem && originalItem.id !== 'custom_text') {
                setPaletteItems(prev => [...prev, originalItem]);
            }
        // CASO 3: Reordenar items DENTRO del CANVAS.
        } else if (isFromCanvas && canvasItems.some(i => i.id === over.id)) {
            if (active.id !== over.id) {
                setCanvasItems((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    /** @description Limpia el canvas y restaura la paleta a su estado inicial. */
    const handleClearCanvas = () => {
        setCanvasItems([]);
        setPaletteItems(listaCompletaDeBloques);
    };

    /** @description Maneja el envío final del formulario al backend. */
    const onSubmit = async (formData) => {
        if (canvasItems.length === 0) {
            setServerError("Debes construir un patrón de nomenclatura arrastrando bloques.");
            return;
        }
        setServerError("");
        // Construye el string del patrón a partir de los items en el canvas.
        const patronNombre = canvasItems.map(item => item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0]).join('');
        const payload = {
            idTipoRecurso: tipoRecurso.id,
            cantidad: formData.cantidad,
            numeroInicio: formData.numeroInicio,
            patronNombre,
        };
        try {
            await apiService.post('/admin/recursos/generar-secuencial', payload);
            onSuccess(); // Notifica al padre del éxito.
        } catch (err) {
            setServerError(err.response?.data?.error?.mensaje || "Error al generar el inventario.");
        }
    };

    // --- RENDERIZADO ---
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className={STYLES.titleSection}>Generador Secuencial: <span className="text-blue-400">{tipoRecurso.nombre}</span></h2>
            <p className="text-gray-400 mt-1 mb-6">Construye el patrón, define la cantidad y previsualiza el resultado.</p>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Columna Izquierda: Paleta de bloques disponibles */}
                    <div className="w-full md:w-[280px] md:flex-shrink-0">
                        <Container id="palette" items={paletteItems} title="Paleta de Bloques">
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-2">Contadores</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {bloquesContador.map(item => paletteItems.some(p => p.id === item.id) && <Item key={item.id} id={item.id} text={item.text()} />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-2">Personalizado</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {bloquesTexto.map(item => <Item key={item.id} id={item.id} text={item.text()} />)}
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                    {/* Columna Derecha: Canvas para construir el patrón y previsualización */}
                    <div className="w-full flex-grow space-y-6">
                        <Container id="canvas" items={canvasItems} title="Tu Patrón" onClear={handleClearCanvas}>
                            <div className={`${STYLES.dnd.canvasContent}`}>
                                {canvasItems.length > 0 ? (
                                    canvasItems.map(item => <Item key={item.id} id={item.id} text={item.text} />)
                                ) : (
                                    <div className={STYLES.dnd.canvasPlaceholder}>
                                        <FiMove size={32} className="mb-2" />
                                        <span>Arrastra bloques aquí</span>
                                    </div>
                                )}
                            </div>
                        </Container>
                        {/* Panel de Previsualización */}
                        <div className="p-4 bg-gray-800 rounded-lg min-h-[150px]">
                            <h3 className="font-semibold text-white">Previsualización</h3>
                            {preview.length > 0 ? (
                                <div className="mt-2 text-gray-400 text-sm">
                                    <p className="mb-2">Se generarán <span className="font-bold text-white">{cantidad || 0}</span> items.</p>
                                    <p>Ejemplos:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {preview.slice(0, 5).map((example, index) => <span key={index} className="font-mono bg-gray-700 px-2 py-1 rounded text-xs">{example}</span>)}
                                        {preview.length > 5 && <span className="font-mono text-xs">... y más</span>}
                                    </div>
                                </div>
                            ) : (<p className="text-gray-500 text-sm mt-2">La previsualización aparecerá aquí.</p>)}
                        </div>
                    </div>
                </div>
                {/* DragOverlay renderiza una copia visual del item que se está arrastrando, desacoplada de su contenedor original. */}
                <DragOverlay>{activeItem ? <Item id={activeItem.id} text={activeItem.text} /> : null}</DragOverlay>
            </DndContext>

            {/* Inputs para Cantidad y Número de Inicio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-700">
                <div>
                    <label className={STYLES.label}>Cantidad a Generar</label>
                    <input type="number" {...register("cantidad")} className={STYLES.input} />
                    {errors.cantidad && <p className={STYLES.errorText}>{errors.cantidad.message}</p>}
                </div>
                <div>
                    <label className={STYLES.label}>Número de Inicio</label>
                    <input type="number" {...register("numeroInicio")} className={STYLES.input} />
                    {errors.numeroInicio && <p className={STYLES.errorText}>{errors.numeroInicio.message}</p>}
                </div>
            </div>

            {serverError && <p className={`${STYLES.errorText} text-center mt-4`}>{serverError}</p>}

            {/* Botones de Acción Finales */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button type="button" onClick={onClose} className={`${STYLES.buttonSecondary} w-full sm:w-auto`}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} className={`${STYLES.buttonPrimaryAuto} w-full sm:w-auto`}>
                    {isSubmitting ? <Spinner type="dots" /> : 'Generar Inventario'}
                </button>
            </div>
        </form>
    );
};

export default GeneradorInventarioModal;
