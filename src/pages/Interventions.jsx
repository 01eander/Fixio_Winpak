import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import InterventionForm from '../components/InterventionForm';
import { Plus, Calendar, User, Truck, List, LayoutGrid } from 'lucide-react';

export default function Interventions() {
    const { interventions, users, units } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

    // Helper to get names
    const getUnitName = (id) => units.find(u => u.id === id)?.name || 'Unknown Unit';
    const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unknown User';

    const COLUMNS = [
        { id: 'PENDING', label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-500' },
        { id: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-blue-500/10 text-blue-500' },
        { id: 'COMPLETED', label: 'Terminado', color: 'bg-green-500/10 text-green-500' }
    ];

    // Helper to get items for column (default PENDING if not set)
    const getItemsForColumn = (status) => {
        return interventions.filter(i => (i.status || 'PENDING') === status);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gradient">Ordenes de Servicio</h2>
                    <div className="flex bg-[var(--bg-panel)] rounded-lg p-1 border border-[var(--border-glass)]">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Nueva Orden
                </button>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {interventions.length === 0 ? (
                        <div className="text-center p-10 text-[var(--text-muted)]">No hay intervenciones registradas.</div>
                    ) : (
                        interventions.map((inter) => (
                            <div key={inter.id} className="glass-panel p-6 hover:translate-x-1 transition-transform">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">MANTENIMIENTO: #{inter.id}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${inter.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                    inter.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {inter.status === 'COMPLETED' ? 'TERMINADO' :
                                                    inter.status === 'IN_PROGRESS' ? 'EN PROGRESO' : 'PENDIENTE'}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                                <Calendar size={12} /> {new Date(inter.date).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">{inter.description}</h3>

                                        <div className="flex gap-4 mt-3 text-sm text-[var(--text-muted)]">
                                            <div className="flex items-center gap-1.5">
                                                <Truck size={14} /> {getUnitName(inter.unitId)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} /> {getUserName(inter.operatorId)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Used Section */}
                                    {inter.itemsUsed && inter.itemsUsed.length > 0 && (
                                        <div className="md:w-1/3 bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-glass)]">
                                            <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Recursos Bosquejados</p>
                                            <ul className="space-y-1">
                                                {inter.itemsUsed.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm">
                                                        <span>{item.name || `Item #${item.itemId}`}</span>
                                                        <span className="font-mono text-[var(--text-accent)]">x{item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Kanban Board View */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex flex-col h-full bg-[var(--bg-app)]/30 rounded-xl border border-[var(--border-glass)] p-4">
                            <div className={`flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-glass)] ${col.color}`}>
                                <h3 className="font-bold uppercase tracking-wider text-sm">{col.label}</h3>
                                <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
                                    {getItemsForColumn(col.id).length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3">
                                {getItemsForColumn(col.id).map(inter => (
                                    <div
                                        key={inter.id}
                                        className="glass-panel p-4 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform border-l-4 border-l-[var(--primary)]"
                                        draggable="true" // Placeholder for interaction
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", inter.id);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] text-[var(--text-muted)] font-mono">#{inter.id}</span>
                                            <User size={12} className="text-[var(--text-muted)]" />
                                        </div>
                                        <p className="font-medium text-sm text-[var(--text-main)] mb-3 line-clamp-3">{inter.description}</p>

                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-auto pt-2 border-t border-[var(--border-glass)]">
                                            <Truck size={12} />
                                            <span className="truncate max-w-[120px]">{getUnitName(inter.unitId)}</span>
                                        </div>
                                    </div>
                                ))}
                                {getItemsForColumn(col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-[var(--border-glass)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-sm opacity-50">
                                        Vacío
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <InterventionForm onClose={() => setShowForm(false)} />
            )}
        </div>
    );
}
