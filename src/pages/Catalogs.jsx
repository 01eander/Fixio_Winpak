import React from 'react';
import { Users, Truck, Warehouse, ClipboardList } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Catalogs() {
    const [, setLocation] = useLocation();

    const catalogs = [
        {
            id: 'mecanicos',
            label: 'Mecánicos',
            icon: Users,
            color: 'bg-blue-500',
            desc: 'Gestión de personal técnico y operadores.',
            count: '3 Activos' // Mock data
        },
        {
            id: 'equipos',
            label: 'Equipos',
            icon: Truck,
            color: 'bg-orange-500',
            desc: 'Maquinaria pesada, vehículos y herramientas.',
            count: '12 Unidades'
        },
        {
            id: 'almacenes',
            label: 'Almacenes',
            icon: Warehouse,
            color: 'bg-emerald-500',
            desc: 'Ubicaciones de inventario y repuestos.',
            count: '1 Central'
        },
        {
            id: 'trabajos',
            label: 'Trabajos',
            icon: ClipboardList,
            color: 'bg-purple-500',
            desc: 'Catálogo de tipos de mantenimiento y tareas.',
            count: '5 Tipos'
        },
        {
            id: 'inventory',
            label: 'Inventario',
            icon: Warehouse,
            color: 'bg-emerald-600',
            desc: 'Gestión de items, herramientas y consumibles.',
            count: 'Ver lista'
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Catálogos del Sistema
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {catalogs.map((match) => {
                    const Icon = match.icon;
                    return (
                        <div
                            key={match.id}
                            className="glass-panel p-6 relative overflow-hidden group hover:bg-white/5 transition-all cursor-pointer border-t-4 border-transparent hover:border-t-blue-400 hover:-translate-y-1"
                            onClick={() => setLocation(match.id === 'inventory' ? '/inventory' : `/catalogs/${match.id}`)}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${match.color} bg-opacity-20 text-white shadow-lg`}>
                                <Icon size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{match.label}</h3>
                            <p className="text-sm text-slate-400 mb-4">{match.desc}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
                                    {match.count}
                                </span>
                                <span className="text-xs text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    GESTIONAR →
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
