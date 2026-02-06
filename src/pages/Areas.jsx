import React, { useState } from 'react';
import { Search, MapPin, Users, Target, Factory, FileDown, Table, ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { AREAS } from '../data/mockData';

export default function Areas() {
    const [search, setSearch] = useState('');

    const filteredItems = AREAS.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.manager.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Áreas</h2>
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
                    <button
                        className="btn-primary flex items-center gap-2 ml-2"
                        onClick={() => { }}
                    >
                        <Plus size={20} /> Nuevo
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar área o responsable..."
                        className="pl-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((area) => (
                    <div key={area.id} className="glass-panel p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                        <div className="h-32 overflow-hidden relative">
                            <img
                                src={area.image}
                                alt={area.name}
                                className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] to-transparent"></div>
                            <div className="absolute bottom-3 left-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Factory size={20} className="text-[var(--primary)]" /> {area.name}
                                </h3>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-sm text-[var(--text-muted)] min-h-[40px]">{area.description}</p>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)]/70 text-xs">Responsable</p>
                                        <p className="font-medium text-[var(--text-main)]">{area.manager}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Target size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)]/70 text-xs">ID Area</p>
                                        <p className="font-medium text-[var(--text-main)]">{area.id}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full btn-ghost p-2 text-sm">Ver Detalles</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
