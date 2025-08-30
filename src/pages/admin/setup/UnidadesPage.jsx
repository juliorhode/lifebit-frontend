import React, { useState, useEffect, use } from 'react';
import { DndContext, closestCenter, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FiMove, FiTrash2 } from 'react-icons/fi';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';

import Container from '../../../components/dnd/Container';
import Item from '../../../components/dnd/Item';
import { STYLES } from '../../../utils/styleConstants.jsx';
import { generateExamples } from '../../../utils/templateUtils.jsx';
import { unidadesFormSchema } from '../../../utils/validationSchemas.jsx';
import { useAuthStore } from '../../../store/authStore.js';
import Spinner from '../../../components/ui/Spinner.jsx';
import apiService from '../../../services/apiService.js';

// --- FUENTE DE VERDAD MAESTRA ---
const bloquesPiso = [
    { id: '{p}', text: (etiqueta) => `${etiqueta} (1)`, category: 'piso' },
    { id: '{P}', text: (etiqueta) => `${etiqueta} (01)`, category: 'piso' },
    { id: '{L}', text: (etiqueta) => `${etiqueta} (A)`, category: 'piso' },
    { id: '{l_p}', text: (etiqueta) => `${etiqueta} (a)`, category: 'piso' },
];
const bloquesUnidad = [
    { id: '{u}', text: (etiqueta) => `${etiqueta} (1)`, category: 'unidad' },
    { id: '{U}', text: (etiqueta) => `${etiqueta} (01)`, category: 'unidad' },
    { id: '{l}', text: (etiqueta) => `${etiqueta} (a)`, category: 'unidad' },
    { id: '{L_u}', text: (etiqueta) => `${etiqueta} (A)`, category: 'unidad' },
];
const bloquesTexto = [
    { id: 'custom_text', text: () => 'Texto Libre', category: 'texto' },
];
const listaCompletaDeBloques = [...bloquesPiso, ...bloquesUnidad, ...bloquesTexto];

const UnidadesPage = () => {
    // --- Lógica de React Hook Form ---
    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(unidadesFormSchema),
        defaultValues: { excepciones: [] },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'excepciones' });

    const onFormSubmit = async (formData) => {
        if (canvasItems.length === 0) {
            setServerError('Debes construir una nomenclatura arrastrando bloques al lienzo.');
            return;
        }
        setServerError('');

        const patronNombre = canvasItems.map(item => {
            return item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0];
        }).join('');

        const payload = {
            patronNombre,
            alicuotaPorDefecto: formData.alicuotaPorDefecto || 0,
            configuracionGeneral: {
                totalPisos: formData.totalPisos,
                unidadesPorDefecto: formData.unidadesPorDefecto,
            },
            excepciones: formData.excepciones,
        };

        try {
            console.log('Payload a enviar:', {payload});
            await apiService.post('/admin/unidades/generar-flexible', payload);
            await getProfile();
            // Refrescamos el perfil para avanzar al siguiente paso
            // El wizard se encargará de mostrar el siguiente paso automáticamente
        } catch (err) {
            setServerError(err.response?.data?.error?.mensaje || 'Ocurrió un error al generar las unidades.');
        }
    };


    // --- LOGICA DE DRAG & DROP ---
    const [paletteItems, setPaletteItems] = useState(listaCompletaDeBloques);
    const [canvasItems, setCanvasItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [preview, setPreview] = useState([]);

    // --- ESTADO PARA LA SEMÁNTICA ---
    const [etiquetaNivel, setEtiquetaNivel] = useState('');
    const [etiquetaUnidad, setEtiquetaUnidad] = useState('');

    const [serverError, setServerError] = useState('');
    const { getProfile } = useAuthStore();


    useEffect(() => {
        // Construimos el patrón usando el ID base de cada item.
        const pattern = canvasItems.map(item => {
            // Para el texto libre, usamos su contenido. Para los demás, el ID original.
            return item.id.startsWith('custom_text-') ? item.text : item.id.split('-')[0];
        }).join('');

        const examples = generateExamples(pattern);
        setPreview(examples);
    }, [canvasItems]);

    const handleClearCanvas = () => {
        setCanvasItems([]);
        setPaletteItems(listaCompletaDeBloques);
    };

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

        // CASO 1: Mover de Paleta a Lienzo
        if (isFromPalette && (overId === 'canvas' || canvasItems.some(i => i.id === overId))) {
            let itemToMove = paletteItems.find(i => i.id === activeId);
            if (!itemToMove) return;

            // --- ESTA ES LA LÓGICA CORREGIDA ---
            let materializedText = '';
            if (typeof itemToMove.text === 'function') {
                const etiqueta = itemToMove.category === 'piso' ? etiquetaNivel : etiquetaUnidad;
                materializedText = itemToMove.text(etiqueta);
            } else {
                materializedText = itemToMove.text;
            }

            // Lógica para Texto Libre
            if (itemToMove.id === 'custom_text') {
                const userText = prompt('Ingresa el texto fijo (ej: "-", "Torre A ")');
                if (!userText) return;
                materializedText = userText;
            }

            const newItem = {
                ...itemToMove,
                id: `${itemToMove.id}-${Date.now()}`,
                text: materializedText, // Usamos el texto ya convertido a string
            };

            // No quitamos "Texto Libre" de la paleta
            if (itemToMove.id !== 'custom_text') {
                setPaletteItems(prev => prev.filter(i => i.id !== activeId));
            }

            setCanvasItems(prev => [...prev, newItem]);
            return;
        }

        // CASO 2: Mover de Lienzo a Paleta
        if (isFromCanvas && overId === 'palette') {
            const itemToMove = canvasItems.find(i => i.id === activeId);
            setCanvasItems(prev => prev.filter(i => i.id !== activeId));

            const originalId = itemToMove.id.split('-')[0];
            const originalItem = listaCompletaDeBloques.find(b => b.id === originalId);

            // No devolvemos el "Texto Libre" a la paleta, ya que siempre está ahí.
            if (originalItem && originalItem.id !== 'custom_text') {
                setPaletteItems(prev => [...prev, originalItem]);
            }
            return;
        }

        // CASO 3: Reordenar dentro del Lienzo
        if (isFromCanvas && canvasItems.some(i => i.id === overId)) {
            if (activeId !== overId) {
                setCanvasItems((items) => {
                    const oldIndex = items.findIndex((item) => item.id === activeId);
                    const newIndex = items.findIndex((item) => item.id === overId);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };
    

    return (
        <div className="p-2">
            <div className="text-center mb-6">
                <h1 className={STYLES.titleSection}>Paso 1: Configuración Semántica</h1>
                <p className="text-gray-400 mt-1">
                    Comencemos por definir la estructura contextual de tu propiedad.
                </p>
            </div>

            {/* --- 2. NUEVA SECCIÓN DE CONFIGURACIÓN SEMÁNTICA --- */}
            <div className={`${STYLES.card} mb-6`}>
                <h3 className="font-semibold text-white mb-4">Define tu Propiedad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={STYLES.label}>¿Cómo llamas a tus agrupaciones principales?</label>
                        <input
                            type="text"
                            value={etiquetaNivel}
                            onChange={(e) => setEtiquetaNivel(e.target.value)}
                            className={`${STYLES.input} capitalize`}
                            placeholder="Ej: Piso, Calle, Manzana"
                        />
                    </div>
                    <div>
                        <label className={STYLES.label}>¿Cómo llamas a las divisiones individuales?</label>
                        <input
                            type="text"
                            value={etiquetaUnidad}
                            onChange={(e) => setEtiquetaUnidad(e.target.value)}
                            className={`${STYLES.input} capitalize`}
                            placeholder="Ej: Apartamento, Local, Casa"
                        />
                    </div>
                </div>
            </div>

            <div className="text-center mb-6">
                <h1 className={STYLES.titleSection}>Paso 2: Crear Estructura</h1>
                <p className="text-gray-400 mt-1">
                    Arrastra y mueve los bloques para construir el formato de tus unidades.
                </p>
            </div>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* UI DINÁMICA: La Paleta */}
                    <div className="w-full md:w-[320px] md:flex-shrink-0">
                        <Container id="palette" items={paletteItems} title="Paleta de Bloques">
                            <h3 className={STYLES.dnd.paletteTitle}>Paleta de Bloques</h3>
                            {/* Grupo de Pisos */}
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-400 mb-2 ">{etiquetaNivel}</p>
                                <div className="grid grid-cols-2 gap-2 ">
                                    {bloquesPiso.map(item => paletteItems.some(pItem => pItem.id === item.id) && <Item key={item.id} id={item.id} text={item.text(etiquetaNivel)} />)}
                                </div>
                            </div>
                            {/* Grupo de Unidades */}
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-400 mb-2 ">{etiquetaUnidad}</p>
                                <div className="grid grid-cols-2 gap-2 ">
                                    {bloquesUnidad.map(item => paletteItems.some(pItem => pItem.id === item.id) && <Item key={item.id} id={item.id} text={item.text(etiquetaUnidad)} />)}
                                </div>
                            </div>
                            {/* Grupo de Texto Fijo */}
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-400 mb-2">Personalizado</p>
                                <div className="grid grid-cols-2 gap-2 ">
                                    {bloquesTexto.map(item => <Item key={item.id} id={item.id} text={item.text()} />)}
                                </div>
                            </div>
                        </Container>
                    </div>

                    {/* El Lienzo y la Previsualización */}
                    <div className="w-full flex-grow space-y-6">
                        <Container id="canvas" items={canvasItems} title={`Tu Nomenclatura de ${etiquetaUnidad}s`} onClear={handleClearCanvas}>
                            <div className="flex justify-between items-center">
                                <h3 className={STYLES.dnd.paletteTitle}>Tu Nomenclatura</h3>
                                {canvasItems.length > 0 && (
                                    <button onClick={handleClearCanvas} className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Limpiar lienzo">
                                        <FiTrash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className={`${STYLES.dnd.canvasContent} mt-4`}>
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
                        <div className="p-4 bg-gray-800 rounded-lg min-h-[100px]">
                            <h3 className="font-semibold text-white">Previsualización</h3>
                            {preview.length > 0 ? (
                                <div className="mt-2 space-y-3">
                                    {preview.map((group) => (
                                        <div key={group.level}>
                                            <p className="text-sm text-gray-400 font-semibold">
                                                {/* TODO: Usar la etiqueta personalizada (ej. "Calle") */}
                                                Para {etiquetaNivel} {group.level}:
                                            </p>
                                            <ul className="list-none pl-4 mt-1 space-y-1">
                                                {group.examples.map((example, index) => (
                                                    <li key={index}>
                                                        <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm text-gray-200">{example}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mt-2">
                                    Aquí verás ejemplos de los nombres generados.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeItem ? (
                        <Item
                            id={activeItem.id}
                            // Aquí es donde hacemos la magia:
                            // Si el texto es una función, la ejecutamos para obtener el string.
                            // Si ya es un string (porque viene del lienzo), simplemente lo usamos.
                            text={
                                typeof activeItem.text === 'function'
                                    ? activeItem.category === 'piso'
                                        ? activeItem.text(etiquetaNivel)
                                        : activeItem.text(etiquetaUnidad)
                                    : activeItem.text
                            }
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <div className="text-center mt-4 mb-6">
                <h1 className={STYLES.titleSection}>Paso 3: Configuración Semántica</h1>
                <p className="text-gray-400 mt-1">
                    Comencemos por definir la estructura y nomenclatura de tu propiedad.
                </p>
            </div>
            {/* --- Formulario de Configuración General --- */}
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <div className={`${STYLES.card} mt-6`}>
                    <h3 className="font-semibold text-white mb-4">Configuración General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={STYLES.label}>Total de {etiquetaNivel}s *</label>
                            <input type="number" {...register("totalPisos")} className={STYLES.input} />
                            {errors.totalPisos && <p className={STYLES.errorText}>{errors.totalPisos.message}</p>}
                        </div>
                        <div>
                            <label className={STYLES.label}>{etiquetaUnidad}s por {etiquetaNivel} (defecto) *</label>
                            <input type="number" {...register("unidadesPorDefecto")} className={STYLES.input} />
                            {errors.unidadesPorDefecto && <p className={STYLES.errorText}>{errors.unidadesPorDefecto.message}</p>}
                        </div>
                        <div>
                            <label className={STYLES.label}>Alícuota por Defecto (Opcional)</label>
                            <input type="number" step="0.01" {...register("alicuotaPorDefecto")} className={STYLES.input} />
                            {errors.alicuotaPorDefecto && <p className={STYLES.errorText}>{errors.alicuotaPorDefecto.message}</p>}
                        </div>
                    </div>
                </div>

                <div className={`${STYLES.card} mt-6`}>
                    <h3 className="font-semibold text-white mb-4">Excepciones (Opcional)</h3>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-4 mb-4">
                            <input type="number" placeholder={`${etiquetaNivel} Nº`} {...register(`excepciones.${index}.piso`)} className={STYLES.input} />
                            <input type="number" placeholder={`Cantidad de ${etiquetaUnidad}s`} {...register(`excepciones.${index}.cantidad`)} className={STYLES.input} />
                            <button type="button" onClick={() => remove(index)}><FiTrash2 className="text-red-500" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ piso: '', cantidad: '' })} className={STYLES.buttonLink}>
                        + Añadir excepción
                    </button>
                </div>

                {serverError && <p className={`${STYLES.errorText} text-center mt-4`}>{serverError}</p>}

                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className={STYLES.buttonPrimaryAuto}>
                        {isSubmitting ? <Spinner type="balls" /> : 'Guardar y Continuar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UnidadesPage;