import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import InterventionForm from '../components/InterventionForm';
import { Plus, Calendar, User, Truck, List, LayoutGrid, Wrench, Filter, Search, BarChart2 } from 'lucide-react';

export default function Interventions() {
    const { interventions, users, units, role, currentUserId, updateInterventionStatus } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
    const [dateFilter, setDateFilter] = useState('current'); // 'current', 'last3', 'custom'
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [selectedUnit, setSelectedUnit] = useState('all'); // 'all' or unitId
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    const [techFilter, setTechFilter] = useState('all'); // 'all' or userId

    const getOrderTypeStyle = (type) => {
        switch (type) {
            case 'PREVENTIVE': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'CORRECTIVE': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'IMPROVEMENT': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    // Filter interventions based on Role AND Date AND Unit AND Status AND Tech AND Search
    const filteredInterventions = interventions.filter(i => {
        // 1. Role Filter
        if (role === 'OPERATOR') {
            if (i.technicianId !== currentUserId && i.operatorId !== currentUserId) return false;
        }



        // 2. Unit Filter
        if (selectedUnit !== 'all') {
            if (i.unitId !== parseInt(selectedUnit)) return false;
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            if (i.status !== statusFilter) return false;
        }

        // 4. Technician Filter
        if (techFilter !== 'all') {
            if (i.technicianId !== parseInt(techFilter)) return false;
        }

        // 5. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesId = i.id.toString().includes(term);
            const matchesDesc = i.description.toLowerCase().includes(term);
            if (!matchesId && !matchesDesc) return false;
        }

        // 6. Date Filter
        const date = new Date(i.date);
        const now = new Date();

        if (dateFilter === 'current') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'last3') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return date >= threeMonthsAgo;
        }
        if (dateFilter === 'custom' && customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            end.setHours(23, 59, 59); // End of day
            return date >= start && date <= end;
        }

        return true;
    });

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
        return filteredInterventions.filter(i => (i.status || 'PENDING') === status);
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
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`p-2 rounded ${viewMode === 'chart' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                            <BarChart2 size={20} />
                        </button>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Nueva Orden
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-3 mb-6 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-muted)] border-r border-white/10 pr-4">
                    <Filter size={16} />
                    <span className="font-semibold uppercase tracking-wider text-xs">Filtros</span>
                </div>

                {/* Date Filter */}
                <div className="flex bg-black/20 rounded-lg p-1">
                    <button
                        onClick={() => setDateFilter('current')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${dateFilter === 'current' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        Mes Actual
                    </button>
                    <button
                        onClick={() => setDateFilter('last3')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${dateFilter === 'last3' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        3 Meses
                    </button>
                    <button
                        onClick={() => setDateFilter('custom')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${dateFilter === 'custom' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        Rango
                    </button>
                </div>

                {/* Units Filter */}
                <div className="flex bg-black/20 rounded-lg p-1">
                    <div className="relative">
                        <select
                            className="bg-transparent text-[var(--text-main)] text-sm px-3 py-1.5 pr-8 rounded-md outline-none focus:bg-white/5 cursor-pointer appearance-none"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                            <option value="all" className="bg-[var(--bg-panel)]">Todos los Equipos</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id} className="bg-[var(--bg-panel)] text-[var(--text-main)]">{u.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-muted)]">
                            <Truck size={14} />
                        </div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex bg-black/20 rounded-lg p-1">
                    <select
                        className="bg-transparent text-[var(--text-main)] text-sm px-3 py-1.5 rounded-md outline-none focus:bg-white/5 cursor-pointer appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all" className="bg-[var(--bg-panel)]">Todos los Estados</option>
                        <option value="PENDING" className="bg-[var(--bg-panel)]">Pendiente</option>
                        <option value="IN_PROGRESS" className="bg-[var(--bg-panel)]">En Progreso</option>
                        <option value="COMPLETED" className="bg-[var(--bg-panel)]">Terminado</option>
                    </select>
                </div>

                {/* Technician Filter */}
                <div className="flex bg-black/20 rounded-lg p-1">
                    <select
                        className="bg-transparent text-[var(--text-main)] text-sm px-3 py-1.5 rounded-md outline-none focus:bg-white/5 cursor-pointer appearance-none"
                        value={techFilter}
                        onChange={(e) => setTechFilter(e.target.value)}
                    >
                        <option value="all" className="bg-[var(--bg-panel)]">Todos los Técnicos</option>
                        {users.filter(u => u.role !== 'OPERATOR').map(u => (
                            <option key={u.id} value={u.id} className="bg-[var(--bg-panel)]">{u.name}</option>
                        ))}
                    </select>
                </div>

                {/* Search Bar */}
                <div className="flex items-center bg-black/20 rounded-lg px-2 ml-auto">
                    <Search size={14} className="text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Buscar ID o descripción..."
                        className="bg-transparent border-none text-sm text-[var(--text-main)] px-2 py-1.5 focus:outline-none w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Custom Date Range Component */}
                {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 w-full mt-2 md:mt-0 md:w-auto">
                        <input
                            type="date"
                            className="bg-[var(--bg-app)] border border-[var(--border-glass)] rounded px-2 py-1 text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
                            value={customRange.start}
                            onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))}
                        />
                        <span className="text-[var(--text-muted)]">to</span>
                        <input
                            type="date"
                            className="bg-[var(--bg-app)] border border-[var(--border-glass)] rounded px-2 py-1 text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
                            value={customRange.end}
                            onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))}
                        />
                    </div>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredInterventions.length === 0 ? (
                        <div className="text-center p-10 text-[var(--text-muted)]">No hay intervenciones que coincidan con los filtros.</div>
                    ) : (
                        filteredInterventions.map((inter) => (
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

                                            {/* Order Type Badge (Now between Status and Date) */}
                                            {inter.orderType && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getOrderTypeStyle(inter.orderType)}`}>
                                                    {inter.orderType}
                                                </span>
                                            )}

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

                                    {/* Activities & Items Section */}
                                    <div className="md:w-1/3 space-y-3">
                                        {/* Activities List */}
                                        {inter.activities && inter.activities.length > 0 && (
                                            <div className="bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-glass)]">
                                                <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase flex items-center gap-1">
                                                    <Wrench size={12} /> Actividades Realizadas
                                                </p>
                                                <ul className="space-y-1">
                                                    {inter.activities.map((act, idx) => (
                                                        <li key={idx} className="text-sm text-[var(--text-main)] flex items-start gap-2">
                                                            <span className="text-[var(--primary)] mt-1">•</span>
                                                            {act}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Items Used List */}
                                        {inter.itemsUsed && inter.itemsUsed.length > 0 && (
                                            <div className="bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-glass)]">
                                                <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase flex items-center gap-1">
                                                    <Truck size={12} /> Recursos Utilizados
                                                </p>
                                                <ul className="space-y-1">
                                                    {inter.itemsUsed.map((item, idx) => (
                                                        <li key={idx} className="flex justify-between text-sm">
                                                            <span>{item.name}</span>
                                                            <span className={`font-mono font-bold ${item.isTool ? 'text-orange-400' : 'text-blue-400'}`}>
                                                                x{item.quantity}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : viewMode === 'chart' ? (
                /* Preventive Chart View */
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[var(--text-muted)] text-xs uppercase border-b border-[var(--border-glass)]">
                                    <th className="p-3 w-48 font-semibold sticky left-0 bg-[var(--bg-panel)] z-10 border-r border-[var(--border-glass)]">
                                        Unidad / Equipo
                                    </th>
                                    <th className="p-3 w-64 font-semibold border-r border-[var(--border-glass)]">
                                        Descripción Actividad
                                    </th>
                                    {/* Monthly Headers (Feb-Apr 2026 for demo) */}
                                    <th colSpan="4" className="p-2 text-center border-r border-[var(--border-glass)] bg-blue-500/10 text-blue-300">FEBRERO</th>
                                    <th colSpan="4" className="p-2 text-center border-r border-[var(--border-glass)] bg-purple-500/10 text-purple-300">MARZO</th>
                                    <th colSpan="4" className="p-2 text-center bg-pink-500/10 text-pink-300">ABRIL</th>
                                </tr>
                                <tr className="bg-white/5 text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border-glass)]">
                                    <th className="p-2 sticky left-0 bg-[var(--bg-panel)] z-10 border-r border-[var(--border-glass)]"></th>
                                    <th className="p-2 border-r border-[var(--border-glass)]"></th>
                                    {/* Weeks S1-S4 for each month */}
                                    {[...Array(12)].map((_, i) => (
                                        <th key={i} className="p-2 text-center w-12 border-r border-[var(--border-glass)]">S{(i % 4) + 1}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-glass)]">
                                {filteredInterventions
                                    .filter(i => i.orderType === 'PREVENTIVE')
                                    .map((inter) => {
                                        const date = new Date(inter.date);
                                        const month = date.getMonth(); // 1 = Feb, 2 = Mar...
                                        // Simple week calculation for demo: (Day / 7)
                                        const week = Math.floor((date.getDate() - 1) / 7);
                                        // Map to grid column index (0-11): (Month - 1) * 4 + Week
                                        // Assuming start Month is Feb (Index 1).
                                        let colIndex = -1;
                                        if (month >= 1 && month <= 3) {
                                            colIndex = (month - 1) * 4 + week;
                                        }

                                        return (
                                            <tr key={inter.id} className="hover:bg-white/5 transition-colors text-sm">
                                                <td className="p-3 font-medium text-[var(--text-main)] sticky left-0 bg-[var(--bg-panel)] z-10 border-r border-[var(--border-glass)] truncate max-w-[12rem]">
                                                    {getUnitName(inter.unitId)}
                                                </td>
                                                <td className="p-3 text-[var(--text-muted)] border-r border-[var(--border-glass)] truncate max-w-[16rem]" title={inter.description}>
                                                    {inter.description}
                                                    <div className="text-[10px] text-[var(--primary)] mt-0.5 font-mono">#{inter.id}</div>
                                                </td>
                                                {[...Array(12)].map((_, i) => (
                                                    <td key={i} className="p-1 border-r border-[var(--border-glass)] relative">
                                                        {i === colIndex && (
                                                            <div
                                                                className="w-full h-6 rounded bg-green-500/80 shadow-lg shadow-green-500/20 mx-auto cursor-pointer hover:bg-green-400 transition-colors"
                                                                title={`Programado: ${date.toLocaleDateString()}`}
                                                            ></div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {filteredInterventions.filter(i => i.orderType === 'PREVENTIVE').length === 0 && (
                            <div className="p-8 text-center text-[var(--text-muted)]">
                                No hay órdenes preventivas para mostrar en el gráfico.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Kanban Board View */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                    {COLUMNS.map(col => (
                        <div
                            key={col.id}
                            className="flex flex-col h-full bg-[var(--bg-app)]/30 rounded-xl border border-[var(--border-glass)] p-4 transition-colors data-[drag-over=true]:bg-white/5"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.setAttribute('data-drag-over', 'true');
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.setAttribute('data-drag-over', 'false');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.setAttribute('data-drag-over', 'false');
                                const interventionId = e.dataTransfer.getData("text/plain");
                                if (interventionId) {
                                    updateInterventionStatus(interventionId, col.id);
                                }
                            }}
                        >
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
                                        draggable="true"
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

                                        {inter.orderType && (
                                            <div className="mb-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getOrderTypeStyle(inter.orderType)}`}>
                                                    {inter.orderType}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-auto pt-2 border-t border-[var(--border-glass)]">
                                            <Truck size={12} />
                                            <span className="truncate max-w-[120px]">{getUnitName(inter.unitId)}</span>
                                        </div>
                                    </div>
                                ))}
                                {getItemsForColumn(col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-[var(--border-glass)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-sm opacity-50">
                                        Arrastrar aquí
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
