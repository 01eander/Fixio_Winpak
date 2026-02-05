import React, { useState } from 'react';
import { MECHANICS } from '../data/mockData';
import { Search, User, ArrowLeft, BadgeCheck } from 'lucide-react';
import { Link } from 'wouter';

export default function Mechanics() {
    const [search, setSearch] = useState('');

    const filteredItems = MECHANICS.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.specialty.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Mecánicos</h2>
                </div>
                <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <span>+ Insertar Nuevo</span>
                </button>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar mecánico..."
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
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Especialidad</th>
                            <th className="p-4 font-semibold">Nivel</th>
                            <th className="p-4 font-semibold text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User size={16} />
                                    </div>
                                    {item.name}
                                </td>
                                <td className="p-4 text-[var(--text-muted)]">{item.specialty}</td>
                                <td className="p-4 text-[var(--text-muted)]">
                                    <span className="px-2 py-1 rounded border border-white/10 text-xs bg-white/5">
                                        {item.level}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Activo' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        <BadgeCheck size={12} /> {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
