import React, { useState } from 'react';
import { UNITS } from '../data/mockData';
import { Search, Truck, ArrowLeft, Activity, QrCode } from 'lucide-react';
import { Link } from 'wouter';
import QrModal from '../components/QrModal';

export default function Equipment() {
    const [search, setSearch] = useState('');
    const [selectedQr, setSelectedQr] = useState(null);

    const filteredItems = UNITS.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Equipos</h2>
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
                        placeholder="Buscar equipo..."
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
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Equipo</th>
                            <th className="p-4 font-semibold">Modelo</th>
                            <th className="p-4 font-semibold text-center">Estado</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-[var(--text-muted)] font-mono text-sm">#{item.id}</td>
                                <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                        <Truck size={20} />
                                    </div>
                                    {item.name}
                                </td>
                                <td className="p-4 text-[var(--text-muted)]">{item.model}</td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <Activity size={12} /> {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => setSelectedQr({ title: item.name, value: `UNIT-${item.id}` })}
                                        className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors group relative"
                                        title="Ver QR"
                                    >
                                        <QrCode size={18} />
                                        <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 rounded whitespace-nowrap text-white">
                                            Ver QR
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedQr && (
                <QrModal
                    title={selectedQr.title}
                    value={selectedQr.value}
                    onClose={() => setSelectedQr(null)}
                />
            )}
        </div>
    );
}
