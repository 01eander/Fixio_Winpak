import React from 'react';
import { Users, Truck, Warehouse, ClipboardList, Factory, Building2, Shield, Tag, Tags } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Catalogs() {
    const [, setLocation] = useLocation();

    const catalogs = [
        {
            id: 'mecanicos',
            label: 'Usuarios',
            icon: Users,
            color: 'bg-blue-500',
            desc: 'Gestión de personal técnico y operadores.',
            count: 'Gestionar'
        },
        {
            id: 'departments',
            label: 'Departamentos',
            icon: Building2,
            color: 'bg-blue-600',
            desc: 'Departamentos y áreas funcionales.',
            count: 'Gestionar'
        },
        {
            id: 'roles',
            label: 'Roles Usuario',
            icon: Shield,
            color: 'bg-indigo-600',
            desc: 'Roles y permisos de usuarios.',
            count: 'Gestionar'
        },
        {
            id: 'equipos',
            label: 'Equipos',
            icon: Truck,
            color: 'bg-orange-500',
            desc: 'Maquinaria pesada, vehículos y herramientas.',
            count: 'Gestionar'
        },
        {
            id: 'asset-categories',
            label: 'Cat. Equipos',
            icon: Tag,
            color: 'bg-orange-600',
            desc: 'Categorías para activos y equipos.',
            count: 'Gestionar'
        },
        {
            id: 'almacenes',
            label: 'Almacenes',
            icon: Warehouse,
            color: 'bg-emerald-500',
            desc: 'Ubicaciones de inventario y repuestos.',
            count: 'Gestionar'
        },
        {
            id: 'areas',
            label: 'Áreas',
            icon: Factory,
            color: 'bg-indigo-500',
            desc: 'Zonas de planta y centros de costo.',
            count: 'Gestionar'
        },
        {
            id: 'inventory',
            label: 'Inventario',
            icon: Warehouse,
            color: 'bg-emerald-600',
            desc: 'Gestión de items, herramientas y consumibles.',
            count: 'Gestionar'
        },
        {
            id: 'inventory-categories',
            label: 'Cat. Items',
            icon: Tags,
            color: 'bg-emerald-700',
            desc: 'Clasificación de materiales e insumos.',
            count: 'Gestionar'
        },
        {
            id: 'trabajos',
            label: 'Trabajos',
            icon: ClipboardList,
            color: 'bg-purple-500',
            desc: 'Catálogo de tipos de mantenimiento y tareas.',
            count: 'Gestionar'
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
