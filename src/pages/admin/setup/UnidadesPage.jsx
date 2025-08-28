import React, { useState } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DraggablePalette from '../../../components/dnd/DraggablePalette';
import DroppableCanvas from '../../../components/dnd/DroppableCanvas';
import Block from '../../../components/dnd/Block'; // Importamos Block para el DragOverlay
import { STYLES } from '../../../utils/styleConstants.jsx';

// --- Bloques Disponibles ---
const bloquesPiso = [
    { id: '{p}', text: 'Piso (1)', category: 'piso' },
    { id: '{P}', text: 'Piso (01)', category: 'piso' },
    { id: '{L}', text: 'Piso (A)', category: 'piso' },
    { id: '{l_p}', text: 'Piso (a)', category: 'piso' },
];
const bloquesUnidad = [
    { id: '{u}', text: 'Unidad (1)', category: 'unidad' },
    { id: '{U}', text: 'Unidad (01)', category: 'unidad' },
    { id: '{l}', text: 'Unidad (a)', category: 'unidad' },
    { id: '{L_u}', text: 'Unidad (A)', category: 'unidad' },
];

// | Resultado Deseado        | Patrón a Utilizar | Explicación |
// | : ---------------------- | : ----------------| : ------------------------------------------------------ |
// | `19-02`                  | `{p}-{U}`         | (Piso simple) - (Unidad con 2 dígitos)                   |
// | `1A, 1B, 2A, 2B`         | `{p}{L_u}`        | (Piso simple) (Letra de Unidad MAYÚSCULA)                |
// | `0101, 0102, 0201`       | `{P}{U}`          | (Piso con 2 dígitos) (Unidad con 2 dígitos)              |
// | `A-01, B-01, C-01`       | `{L}-{U}`         | (Letra de Piso MAYÚSCULA) - (Unidad con 2 dígitos)       |
// | `A-1, A-2`(Texto Fijo)   | `A-{u}`           | (Texto "A-") (Unidad simple)                             |
// | `Torre A 01-01`          | `Torre A {P}-{U}` | (Texto "Torre A ") (Piso 2 dígitos) - (Unidad 2 dígitos) |
// | `Torre A 01-01`          | `A-{P}-{U}`       | (Texto "A-") (Piso 2 dígitos) - (Unidad 2 dígitos)       |
// | `01-A1, 01-B1, 02-A1`    | `{P}-{L_u}1`      | (Piso 2 dígitos) - (Letra Unidad MAYÚSCULA) (Texto "1")  |
// | `A01-01, B02-01`         | `{L}{P}-{U}`      | (Letra Piso) (Piso 2 dígitos) -(Unidad 2 dígitos)        |

// TODO: Añadir un bloque de Texto Fijo con category: 'texto'
const bloquesDisponibles = [...bloquesPiso, ...bloquesUnidad];

const UnidadesPage = () => {
    const [canvasItems, setCanvasItems] = useState([]);
    // Estado para saber qué bloque se está arrastrando (para el efecto visual)
    const [activeItem, setActiveItem] = useState(null);


    const handleDragStart = (event) => {
        const { active } = event;
        const item = canvasItems.find(i => i.id === active.id) || bloquesDisponibles.find(i => i.id === active.id);
        setActiveItem(item);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveItem(null);
        if (!over) return;

        // Eliminar si se suelta en la paleta
        if (over.id === 'palette' && active.data.current?.isCanvasItem) {
            setCanvasItems((items) => items.filter((item) => item.id !== active.id));
            return;
        }

        const isTargetingCanvas = over.id === 'canvas' || canvasItems.some(i => i.id === over.id);
        if (!isTargetingCanvas) return;

        const isMovingCanvasItem = active.data.current?.isCanvasItem;

        if (isMovingCanvasItem) {
            // Reordenar
            if (active.id !== over.id) {
                setCanvasItems((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    return newIndex === -1 ? items : arrayMove(items, oldIndex, newIndex);
                });
            }
        } else {
            // AÑADIR SIEMPRE, SIN REEMPLAZAR
            const draggedItem = bloquesDisponibles.find(item => item.id === active.id);
            if (draggedItem) {
                const newItem = { ...draggedItem, id: `${draggedItem.id}-${Date.now()}` };
                const overIndex = canvasItems.findIndex(item => item.id === over.id);

                if (overIndex !== -1) {
                    const newItems = [...canvasItems];
                    newItems.splice(overIndex + 1, 0, newItem);
                    setCanvasItems(newItems);
                } else {
                    setCanvasItems(prevItems => [...prevItems, newItem]);
                }
            }
        }
    };

    return (
        <div className="p-2">
            <div className="text-center mb-6">
                <h1 className={STYLES.titleSection}>Paso 1: Crear Unidades</h1>
                <p className="text-gray-400 mt-1">
                    Construye el formato de nombre para tus unidades arrastrando los bloques.
                </p>
            </div>

            <DndContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
            >
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[320px] md:flex-shrink-0">
                        <DraggablePalette
                            id="palette"
                            grupos={[
                                { titulo: 'Pisos', items: bloquesPiso },
                                { titulo: 'Unidades', items: bloquesUnidad },
                            ]}
                        />
                    </div>

                    <div className="w-full flex-grow space-y-6">
                        <DroppableCanvas id="canvas" items={canvasItems} onClear={() => setCanvasItems([])} />

                        <div className="p-4 bg-gray-800 rounded-lg min-h-[100px]">
                            <h3 className="font-semibold text-white">Previsualización</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                A medida que construyas tu nomenclatura, aquí verás ejemplos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* DragOverlay crea un "fantasma" del elemento que se está arrastrando,
                    lo que nos da un control total sobre su apariencia. */}
                <DragOverlay>
                    {activeItem ? <Block id={activeItem.id} text={activeItem.text} /> : null}
                </DragOverlay>

            </DndContext>

            <div className="mt-8 flex justify-end">
                <button className={STYLES.buttonPrimaryAuto}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default UnidadesPage;