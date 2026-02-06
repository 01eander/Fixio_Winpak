import React, { useState } from 'react';
import { JOBS } from '../data/mockData';
import { Search, ClipboardList, ArrowLeft, Clock, FileDown, Table } from 'lucide-react';
import { Link } from 'wouter';

export default function Jobs() {
    const [search, setSearch] = useState('');

    const filteredItems = JOBS.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Trabajos</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => alert('Descargando PDF...')}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Descargar PDF"
                    >
                        <FileDown size={20} />
                    </button>
                    <button
                        onClick={() => alert('Descargando Excel...')}
                        className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                        title="Descargar Excel"
                    >
                        <Table size={20} />
                    </button>
                    <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <span>+ Insertar Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar trabajo..."
                        className="pl-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-glass)] bg-white/5 text-[var(--text-muted)] text-sm uppercase">
                            <th className="p-4 font-semibold">Tarea / Trabajo</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 font-semibold text-center">Horas Est.</th>
                            <th className="p-4 font-semibold text-right">Costo Base</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <ClipboardList size={16} />
                                    </div>
                                    {item.name}
                                </td>
                                <td className="p-4 text-[var(--text-muted)]">{item.type}</td>
                                <td className="p-4 text-center flex items-center justify-center gap-2 text-[var(--text-muted)]">
                                    <Clock size={14} /> {item.estimartedHours}h
                                </td>
                                <td className="p-4 text-right text-[var(--text-muted)]">
                                    {item.cost > 0 ? `$${item.cost}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
