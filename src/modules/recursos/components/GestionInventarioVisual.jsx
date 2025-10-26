import React, { useState, useMemo } from 'react';
import { useGestionInventario } from '../hooks/useGestionInventario';
import RecursoCard from './RecursoCard';
import InventarioToolbar from './InventarioToolbar';
import SearchBar from '../../../components/ui/SearchBar';
import { STYLES } from '../../../utils/styleConstants';
import Modal from '../../../components/ui/Modal';

// --- MAPEO DE CLASES ESTÁTICAS PARA TAILWIND ---
// Este objeto resuelve el problema de la purga de CSS.
// Al tener los nombres completos de las clases en el código, Tailwind los detectará y los incluirá en el build final.
const colorMap = {
    blue: {
        border: 'border-blue-500',
        text: 'text-blue-500',
        shadow: 'shadow-blue-500/20',
    },
    green: {
        border: 'border-green-500',
        text: 'text-green-500',
        shadow: 'shadow-green-500/20',
    },
    yellow: {
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        shadow: 'shadow-yellow-500/20',
    },
    red: {
        border: 'border-red-500',
        text: 'text-red-500',
        shadow: 'shadow-red-500/20',
    },
};

const LeyendaCard = ({ label, count, color, isActive, onClick }) => {
    // Obtenemos el conjunto de clases del mapeo. Usamos 'blue' como fallback seguro.
    const colors = colorMap[color];

    return (
        <button
            onClick={onClick}
            // Ahora aplicamos las clases completas desde el mapeo.
            className={`card-theme p-4 text-center truncate w-full transition-all duration-200 ${isActive ? `${colors.border} ${colors.shadow} scale-110` : 'opacity-80 hover:opacity-100'}`}
        >
            <p className="text-secondary text-sm">{label}</p>
            <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
        </button>
    );
};

const GestionInventarioVisual = ({ tipoRecurso, onGoBack, onSuccess, listaUbicaciones }) => {
    const {
        isLoading, items, selectedIds,
        hayCambiosSinGuardar, sesionGuardadaDetectada,
        toggleSelection, handleMoverUbicacion, handleCambiarEstado,
        guardarCambios, descartarCambios, restaurarSesion,
        descartarSesionGuardada, 
    } = useGestionInventario(tipoRecurso);

    
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroUbicacion, setFiltroUbicacion] = useState('todas');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    
    const estadisticas = useMemo(() => {
        return items.reduce((acc, item) => {
            acc.total++;
            acc[item.estado_operativo] = (acc[item.estado_operativo] || 0) + 1;
            return acc;
        }, { total: 0, operativo: 0, en_mantenimiento: 0, no_operativo: 0 });
    }, [items]);
   

    const ubicacionesUnicas = useMemo(() => ['todas', ...Array.from(new Set(items.map(item => item.ubicacion).filter(Boolean)))], [items]);

    const itemsFiltrados = useMemo(() => {
        return items.filter(item => {
            const pasaFiltroEstado = filtroEstado === 'todos' || item.estado_operativo === filtroEstado;
            const pasaFiltroUbicacion = filtroUbicacion === 'todas' || item.ubicacion === filtroUbicacion;
            const pasaBusqueda = item.identificador_unico.toLowerCase().includes(terminoBusqueda.toLowerCase());
            return pasaFiltroEstado && pasaFiltroUbicacion && pasaBusqueda;
        });
    }, [items, filtroEstado, filtroUbicacion, terminoBusqueda]);

    if (isLoading) {
        return <p className="text-center text-secondary p-8">Cargando inventario...</p>;
    }

    return (
        <div className="flex flex-col h-full bg-surface-secondary p-6 rounded-lg">
            {sesionGuardadaDetectada && (
                <div className="bg-blue-900/50 border border-blue-700 p-3 rounded-lg mb-4 flex items-center justify-between gap-3">
                    <p className="text-blue-200">Detectamos cambios sin guardar de una sesión anterior.</p>
                    <div className="flex items-center gap-3">
                        <button onClick={restaurarSesion} className="btn-primary px-3 py-1 text-sm">Restaurar</button>
                        <button onClick={descartarSesionGuardada} className={STYLES.buttonLink}>Descartar</button>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-semibold text-primary">Gestión de Inventario: {tipoRecurso.nombre}</h3>
                <button onClick={onGoBack} className={STYLES.buttonLink}>Volver a Tabla</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
                <LeyendaCard label="Total de Ítems" count={estadisticas.total} color="blue" isActive={filtroEstado === 'todos'} onClick={() => setFiltroEstado('todos')} />
                <LeyendaCard label="Operativos" count={estadisticas.operativo} color="green" isActive={filtroEstado === 'operativo'} onClick={() => setFiltroEstado('operativo')} />
                <LeyendaCard label="En Mantenimiento" count={estadisticas.en_mantenimiento} color="yellow" isActive={filtroEstado === 'en_mantenimiento'} onClick={() => setFiltroEstado('en_mantenimiento')} />
                <LeyendaCard label="No Operativos" count={estadisticas.no_operativo} color="red" isActive={filtroEstado === 'no_operativo'} onClick={() => setFiltroEstado('no_operativo')} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-shrink-0">
                <select onChange={(e) => setFiltroUbicacion(e.target.value)} className={`${STYLES.input} flex-1`}>
                    {ubicacionesUnicas.map(loc =>
                        <option key={loc} value={loc}>{loc === 'todas' ? 'Todas las Ubicaciones' : loc}</option>
                    )}
                </select>
                <SearchBar value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} placeholder='Buscar por identificador...' className='flex-1' />
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                {itemsFiltrados.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4  gap-4 m-4 p-2">
                        {itemsFiltrados.map(item => (<RecursoCard key={item.id} item={item} mode='inventario' onClick={toggleSelection} />))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-tertiary">
                        <p>No se encontraron ítems que coincidan con los filtros aplicados.</p>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 pt-4 mt-auto">
                {selectedIds.size > 0 && (
                    <InventarioToolbar
                        selectedCount={selectedIds.size}
                        pisos={listaUbicaciones}
                        onMoverUbicacion={handleMoverUbicacion}
                        onCambiarEstado={handleCambiarEstado}
                    />
                )}
                {hayCambiosSinGuardar && (
                    <div className={`flex justify-end gap-4 ${selectedIds.size > 0 ? 'mt-4' : ''}`}>
                        <button onClick={descartarCambios} className="btn-secondary">Descartar Cambios</button>
                        <button onClick={guardarCambios} className="btn-primary">Guardar Cambios</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionInventarioVisual; 