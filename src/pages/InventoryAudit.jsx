import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Link } from 'wouter';
import {
    ArrowLeft, Search, Plus, CheckCircle, AlertTriangle,
    ClipboardList, Save, X, RefreshCw, BarChart3, Printer
} from 'lucide-react';

const MOCK_AUDITS = [
    { id: 'AUD-001', date: '2026-01-15', status: 'COMPLETED', itemsCount: 15, accuracy: '98%' },
    { id: 'AUD-002', date: '2026-02-01', status: 'COMPLETED', itemsCount: 42, accuracy: '95%' },
    { id: 'AUD-003', date: '2026-02-06', status: 'IN_PROGRESS', itemsCount: 10, accuracy: '-' },
];

export default function InventoryAudit() {
    const { inventory } = useStore();
    const [audits, setAudits] = useState(MOCK_AUDITS);
    const [activeAudit, setActiveAudit] = useState(null);
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);

    // Audit Creation State
    const [auditScope, setAuditScope] = useState('RANDOM'); // RANDOM, CONSUMABLES, TOOLS, ALL

    // Active Audit State
    const [auditItems, setAuditItems] = useState([]);
    const [search, setSearch] = useState('');

    const handleCreateAudit = () => {
        let itemsToAudit = [];

        switch (auditScope) {
            case 'CONSUMABLES':
                itemsToAudit = inventory.filter(i => i.isConsumable);
                break;
            case 'TOOLS':
                itemsToAudit = inventory.filter(i => !i.isConsumable);
                break;
            case 'ALL':
                itemsToAudit = [...inventory];
                break;
            case 'RANDOM':
            default:
                // Random 5 items for demo
                itemsToAudit = [...inventory].sort(() => 0.5 - Math.random()).slice(0, 5);
                break;
        }

        const newAuditItems = itemsToAudit.map(item => ({
            ...item,
            systemQty: item.stock,
            physicalQty: '', // Empty initially
            variance: 0,
            status: 'PENDING' // PENDING, MATCH, VARIANCE
        }));

        const newAudit = {
            id: `AUD-${String(audits.length + 3).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            status: 'IN_PROGRESS',
            itemsCount: newAuditItems.length,
            accuracy: '0%'
        };

        setActiveAudit(newAudit);
        setAuditItems(newAuditItems);
        setIsCreationModalOpen(false);
    };

    const handleResumeAudit = (audit) => {
        // Re-generate mock items or fetch from store in real app
        // For demo, we just generate random items again or filter by hypothetical scope
        // Assuming the simulated one is RANDOM for now
        const itemsToAudit = [...inventory].sort(() => 0.5 - Math.random()).slice(0, audit.itemsCount);

        const resumedAuditItems = itemsToAudit.map(item => ({
            ...item,
            systemQty: item.stock,
            physicalQty: '',
            variance: 0,
            status: 'PENDING'
        }));

        setActiveAudit(audit);
        setAuditItems(resumedAuditItems);
    };

    const handleUpdateQuantity = (itemId, qty) => {
        setAuditItems(items => items.map(item => {
            if (item.id === itemId) {
                const physical = parseInt(qty) || 0;
                const variance = physical - item.systemQty;
                return {
                    ...item,
                    physicalQty: qty,
                    variance,
                    status: variance === 0 ? 'MATCH' : 'VARIANCE'
                };
            }
            return item;
        }));
    };

    const handleFinishAudit = () => {
        // Calculate accuracy
        const matches = auditItems.filter(i => i.status === 'MATCH').length;
        const accuracy = Math.round((matches / auditItems.length) * 100) + '%';

        const completedAudit = { ...activeAudit, status: 'COMPLETED', accuracy };
        setAudits([completedAudit, ...audits]);
        setActiveAudit(null);
        setAuditItems([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const scannedId = search.trim();
            const itemMatch = auditItems.find(item =>
                `ITEM-${item.id}` === scannedId || item.id === scannedId
            );

            if (itemMatch) {
                // Increment physical qty by 1
                const currentQty = parseInt(itemMatch.physicalQty) || 0;
                handleUpdateQuantity(itemMatch.id, currentQty + 1);

                // Clear search and show feedback
                setSearch('');
                // Ideally show a toast here, for now just console or visual cue
            }
        }
    };

    const filteredAuditItems = auditItems.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        `ITEM-${i.id}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/inventory" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Inventarios Cíclicos
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">Auditoría y conciliación de stock</p>
                    </div>
                </div>
                {!activeAudit && (
                    <button
                        onClick={() => setIsCreationModalOpen(true)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Plus size={20} /> Iniciar Auditoría
                    </button>
                )}
            </div>

            {/* Active Audit View */}
            {activeAudit ? (
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded-xl border border-indigo-500/30 flex justify-between items-center shadow-lg shadow-indigo-900/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                <RefreshCw size={24} className="animate-spin-slow" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-white">Auditoría en Curso: {activeAudit.id}</h3>
                                <p className="text-indigo-300 text-sm">Contando {auditItems.length} items • Progreso: {auditItems.filter(i => i.physicalQty !== '').length}/{auditItems.length}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Printer size={18} /> <span className="hidden sm:inline">Imprimir Hoja</span>
                            </button>
                            <button
                                onClick={() => { setActiveAudit(null); setAuditItems([]); }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleFinishAudit}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Finalizar y Conciliar
                            </button>
                        </div>
                    </div>

                    {/* Counting Interface */}
                    <div className="glass-panel overflow-hidden border border-slate-700/50">
                        <div className="p-4 border-b border-slate-700/50 flex gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar item o Escanear Código..."
                                    className="pl-10 w-full bg-slate-800 border-slate-700 rounded-lg text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="hidden md:block text-xs text-slate-400 self-center">
                                Tip: Presiona Enter tras escanear un código (ej. ITEM-123) para incrementar +1
                            </div>
                        </div>
                    </div>
                    <style>{`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                .print-content, .print-content * {
                                    visibility: visible;
                                }
                                .print-content {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    background: white;
                                    color: black;
                                    padding: 20px;
                                }
                                .print-hidden {
                                    display: none !important;
                                }
                                table {
                                    border-collapse: collapse;
                                    width: 100%;
                                }
                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                    color: black !important;
                                }
                                th {
                                    background-color: #f2f2f2 !important;
                                }
                                input {
                                    border: none;
                                    border-bottom: 1px solid #000;
                                    background: transparent;
                                    color: black;
                                }
                            }
                        `}</style>
                    <div className="print-content">
                        <div className="hidden print:block mb-6">
                            <h1 className="text-2xl font-bold mb-2">Hoja de Conteo de Inventario</h1>
                            <div className="flex justify-between text-sm">
                                <p><strong>Auditoría:</strong> {activeAudit.id}</p>
                                <p><strong>Fecha:</strong> {activeAudit.date}</p>
                                <p><strong>Responsable:</strong> _______________________</p>
                            </div>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-700">Item</th>
                                    <th className="p-4 font-bold border-b border-slate-700 text-center">Stock Sistema</th>
                                    <th className="p-4 font-bold border-b border-slate-700 text-center w-40">Conteo Físico</th>
                                    <th className="p-4 font-bold border-b border-slate-700 text-center print-hidden">Diferencia</th>
                                    <th className="p-4 font-bold border-b border-slate-700 text-center print-hidden">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredAuditItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{item.name}</td>
                                        <td className="p-4 text-center text-slate-400 font-mono">{item.systemQty}</td>
                                        <td className="p-4 text-center">
                                            <input
                                                type="number"
                                                className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-center font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none print:hidden"
                                                value={item.physicalQty}
                                                onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                                placeholder="0"
                                            />
                                            <div className="hidden print:block w-32 h-8 border-b border-black mx-auto"></div>
                                        </td>
                                        <td className="p-4 text-center font-bold print-hidden">
                                            {item.physicalQty !== '' && (
                                                <span className={item.variance === 0 ? 'text-slate-500' : item.variance > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {item.variance > 0 ? '+' : ''}{item.variance}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center print-hidden">
                                            {item.physicalQty !== '' && (
                                                item.status === 'MATCH' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                                        <CheckCircle size={12} /> Correcto
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                                        <AlertTriangle size={12} /> Desviación
                                                    </span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* History Dashboard */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Resumen de Exactitud</h3>
                                <p className="text-sm text-slate-400">Últimos 30 días</p>
                            </div>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 w-[96%]"></div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-slate-400">Promedio General</span>
                            <span className="font-bold text-white">96.5%</span>
                        </div>
                    </div>

                    {/* Past Audits List */}
                    <div className="col-span-1 md:col-span-3">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ClipboardList size={20} className="text-slate-400" /> Historial de Auditorías
                        </h3>
                        <div className="glass-panel overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">ID Auditoría</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4 text-center">Items Auditados</th>
                                        <th className="p-4 text-center">Exactitud</th>
                                        <th className="p-4 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {audits.map(audit => (
                                        <tr key={audit.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono font-bold text-indigo-300">{audit.id}</td>
                                            <td className="p-4 text-slate-300">{audit.date}</td>
                                            <td className="p-4 text-center text-white">{audit.itemsCount}</td>
                                            <td className="p-4 text-center font-bold text-green-400">{audit.accuracy}</td>
                                            <td className="p-4 text-center">
                                                {audit.status === 'IN_PROGRESS' ? (
                                                    <button
                                                        onClick={() => handleResumeAudit(audit)}
                                                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-xs font-bold border border-yellow-500/50 transition-all flex items-center gap-1 mx-auto"
                                                    >
                                                        <RefreshCw size={12} className="animate-spin-slow" /> Continuar
                                                    </button>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                                                        {audit.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal */}
            {
                isCreationModalOpen && (
                    <div className="fixed inset-0 z[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-[#1e293b] border border-slate-600 w-full max-w-md rounded-xl shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Nueva Auditoría Cíclica</h3>
                                <button onClick={() => setIsCreationModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-sm text-slate-400 mb-4">Seleccione el alcance de la auditoría para generar la lista de conteo.</p>

                                <button
                                    onClick={() => setAuditScope('RANDOM')}
                                    className={`w-full p-4 rounded-lg border text-left transition-all ${auditScope === 'RANDOM' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                                >
                                    <div className="font-bold">Items Aleatorios (Muestra)</div>
                                    <div className="text-xs opacity-70">Selecciona 5 items al azar para verificación rápida.</div>
                                </button>

                                <button
                                    onClick={() => setAuditScope('CONSUMABLES')}
                                    className={`w-full p-4 rounded-lg border text-left transition-all ${auditScope === 'CONSUMABLES' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                                >
                                    <div className="font-bold">Solo Consumibles</div>
                                    <div className="text-xs opacity-70">Auditar aceites, filtros, solventes, etc.</div>
                                </button>

                                <button
                                    onClick={() => setAuditScope('TOOLS')}
                                    className={`w-full p-4 rounded-lg border text-left transition-all ${auditScope === 'TOOLS' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                                >
                                    <div className="font-bold">Solo Herramientas</div>
                                    <div className="text-xs opacity-70">Auditar llaves, taladros, equipos de medición.</div>
                                </button>
                            </div>

                            <button
                                onClick={handleCreateAudit}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-lg flex justify-center items-center gap-2"
                            >
                                Generar Hoja de Conteo <CheckCircle size={18} />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
