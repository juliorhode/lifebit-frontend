import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DndContext, closestCenter, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Container from '../../../components/dnd/Container';
import Item from '../../../components/dnd/Item';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { generateExamples } from '../../../utils/templateUtils.jsx';
import { FiMove, FiTrash2 } from 'react-icons/fi';
import { generadorInventarioSchema } from '../../../utils/validationSchemas.jsx';
import Spinner from '../../../components/ui/Spinner'; // Importamos el Spinner

// --- Bloques Disponibles para la Paleta de Recursos ---
const bloquesContador = [
    { id: '{c}', text: 'Contador (1)', category: 'contador' },
    { id: '{c_c}', text: 'Contador (01)', category: 'contador' },
    { id: '{C}', text: 'Contador (001)', category: 'contador' },
];
const bloquesTexto = [{ id: 'custom_text', text: 'Texto Libre', category: 'texto' }];
const listaCompletaDeBloques = [...bloquesContador, ...bloquesTexto];

const GeneradorInventarioModal = ({ onClose, onSuccess, tipoRecurso }) => {
    const [paletteItems, setPaletteItems] = useState(listaCompletaDeBloques);
    const [canvasItems, setCanvasItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [preview, setPreview] = useState([]);
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(generadorInventarioSchema),
        defaultValues: { cantidad: 10, numeroInicio: 1 },
    });

    const cantidad = watch('cantidad');
    const numeroInicio = watch('numeroInicio');

    useEffect(() => {
        const pattern = canvasItems.map(item => item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0]).join('');
        const examples = generateExamples(pattern, cantidad, numeroInicio);
        setPreview(examples);
    }, [canvasItems, cantidad, numeroInicio]);

    // --- LÓGICA DE DRAG AND DROP (Ahora completa) ---
    const handleDragStart = (event) => {
        const { active } = event;
        const allItems = [...paletteItems, ...canvasItems];
        const item = allItems.find(i => i.id === active.id);
        setActiveItem(item);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveItem(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const isFromPalette = paletteItems.some(i => i.id === activeId);
        const isFromCanvas = canvasItems.some(i => i.id === activeId);

        if (isFromPalette && (overId === 'canvas' || canvasItems.some(i => i.id === overId))) {
            let itemToMove = paletteItems.find(i => i.id === activeId);
            if (itemToMove.id === 'custom_text') {
                const userText = prompt('Ingresa el texto fijo (ej: "-", "Torre A ")');
                if (!userText) return;
                itemToMove = { ...itemToMove, text: userText };
                setCanvasItems(prev => [...prev, { ...itemToMove, id: `custom_text-${Date.now()}` }]);
                return;
            }
            setPaletteItems(prev => prev.filter(i => i.id !== activeId));
            setCanvasItems(prev => [...prev, { ...itemToMove, id: `${itemToMove.id}-${Date.now()}` }]);
        } else if (isFromCanvas && overId === 'palette') {
            const itemToMove = canvasItems.find(i => i.id === activeId);
            setCanvasItems(prev => prev.filter(i => i.id !== activeId));
            const originalId = itemToMove.id.split('-')[0];
            const originalItem = listaCompletaDeBloques.find(b => b.id === originalId);
            if (originalItem && originalItem.id !== 'custom_text') {
                setPaletteItems(prev => [...prev, originalItem]);
            }
        } else if (isFromCanvas && canvasItems.some(i => i.id === overId)) {
            if (activeId !== overId) {
                setCanvasItems((items) => {
                    const oldIndex = items.findIndex((item) => item.id === activeId);
                    const newIndex = items.findIndex((item) => item.id === overId);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const handleClearCanvas = () => {
        setCanvasItems([]);
        setPaletteItems(listaCompletaDeBloques);
    };

    // --- LÓGICA DE ENVÍO ---
    const onSubmit = async (formData) => {
        if (canvasItems.length === 0) {
            setServerError("Debes construir un patrón arrastrando bloques al lienzo.");
            return;
        }
        setServerError("");

        const patronNombre = canvasItems.map(item => item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0]).join('');

        const payload = {
            idTipoRecurso: tipoRecurso.id,
            cantidad: formData.cantidad,
            numeroInicio: formData.numeroInicio,
            patronNombre,
        };

        try {
            await apiService.post('/admin/recursos/generar-secuencial', payload);
            onSuccess(); // Notifica al padre del éxito
        } catch (err) {
            setServerError(err.response?.data?.error?.mensaje || "Error al generar el inventario.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className={STYLES.titleSection}>Generador Secuencial: <span className="text-blue-400">{tipoRecurso.nombre}</span></h2>
            <p className="text-gray-400 mt-1 mb-6">Construye el patrón, define la cantidad y previsualiza el resultado.</p>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[280px] md:flex-shrink-0">
                        <Container id="palette" items={paletteItems} title="Paleta de Bloques">
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-2">Contadores</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {bloquesContador.map(item => paletteItems.some(p => p.id === item.id) && <Item key={item.id} id={item.id} text={item.text} />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-2">Personalizado</p>
                                    <div className="grid grid-cols-1">
                                        {bloquesTexto.map(item => <Item key={item.id} id={item.id} text={item.text} />)}
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>

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
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="font-semibold text-white">Previsualización</h3>
                            {preview.length > 0 ? (
                                <div className="mt-2 text-gray-400 text-sm">
                                    <p>Se generarán <span className="font-bold text-white">{cantidad}</span> items.</p>
                                    <p>Ejemplos:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {preview.map((example, index) => (
                                            <span key={index} className="font-mono bg-gray-700 px-2 py-1 rounded text-xs">{example}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mt-2">La previsualización aparecerá aquí.</p>
                            )}
                        </div>
                    </div>
                </div>
                <DragOverlay>{activeItem ? <Item id={activeItem.id} text={activeItem.text} /> : null}</DragOverlay>
            </DndContext>

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
            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={onClose} className={STYLES.buttonSecondary}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} className={STYLES.buttonPrimaryAuto}>
                    {isSubmitting ? <Spinner type="dots" /> : 'Generar Inventario'}
                </button>
            </div>
        </form>
    );
};

export default GeneradorInventarioModal;