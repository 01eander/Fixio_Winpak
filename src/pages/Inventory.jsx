import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { WAREHOUSES } from '../data/mockData';
import { Search, Droplets, Wrench, ArrowLeft, QrCode } from 'lucide-react';
import { Link } from 'wouter';
import QrModal from '../components/QrModal';

export default function Inventory() {
    const { inventory, role } = useStore();
    const [filter, setFilter] = useState('ALL'); // ALL, CONSUMABLE, TOOL
    const [search, setSearch] = useState('');
    const [selectedQr, setSelectedQr] = useState(null);

    const filteredItems = inventory.filter(item => {
        const matchesFilter =
            filter === 'ALL' ||
            (filter === 'CONSUMABLE' && item.isConsumable) ||
            (filter === 'TOOL' && !item.isConsumable);

        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Inventario Unificado</h2>
                </div>
                <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <span>+ Insertar Nuevo</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar item..."
                            className="pl-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-1 bg-[var(--bg-panel)] p-1 rounded-lg border border-[var(--border-glass)]">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilter('CONSUMABLE')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${filter === 'CONSUMABLE' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            Consumibles
                        </button>
                        <button
                            onClick={() => setFilter('TOOL')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${filter === 'TOOL' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            Herr.
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-glass)] bg-white/5 text-[var(--text-muted)] text-sm uppercase">
                            <th className="p-4 font-semibold">Item</th>
                            <th className="p-4 font-semibold">Categoría</th>
                            <th className="p-4 font-semibold">Almacén</th>
                            <th className="p-4 font-semibold text-center">Tipo</th>
                            <th className="p-4 font-semibold text-right">Stock</th>
                            {role === 'ADMIN' && <th className="p-4 font-semibold text-right">Costo</th>}
                            <th className="p-4 font-semibold text-center">Estado</th>
                            <th className="p-4 font-semibold text-center">QR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-[var(--text-main)]">{item.name}</td>
                                <td className="p-4 text-[var(--text-muted)]">{item.category}</td>
                                <td className="p-4 text-[var(--text-muted)] text-sm">
                                    {WAREHOUSES.find(w => w.id === item.warehouseId)?.name || 'N/A'}
                                </td>
                                <td className="p-4 text-center">
                                    {item.isConsumable ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                                            <Droplets size={12} /> Consumible
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">
                                            <Wrench size={12} /> Herramienta
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`font-bold ${item.stock < 10 ? 'text-[var(--danger)]' : 'text-[var(--text-main)]'}`}>
                                        {item.stock}
                                    </span>
                                </td>
                                {role === 'ADMIN' && (
                                    <td className="p-4 text-right text-[var(--text-muted)]">${item.cost.toFixed(2)}</td>
                                )}
                                <td className="p-4 text-center">
                                    <div className="w-24 h-1.5 bg-[var(--bg-app)] rounded-full overflow-hidden mx-auto">
                                        <div
                                            className={`h-full rounded-full ${item.stock < 10 ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'}`}
                                            style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {!item.isConsumable && (
                                        <button
                                            onClick={() => setSelectedQr({ title: item.name, value: `ITEM-${item.id}` })}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                            title="Ver QR"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        No se encontraron items.
                    </div>
                )}
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
