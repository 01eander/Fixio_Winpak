import React from 'react';
import { ClipboardList, FileSpreadsheet, FileText } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Bitacoras() {
    const [, setLocation] = useLocation();
    const bitacoras = [
        {
            id: 'diecut',
            label: 'BITACORA DIECUT',
            icon: ClipboardList,
            color: 'bg-purple-500',
            desc: 'Registro histórico de operaciones en Diecut.',
            status: 'Solo Lectura'
        },
        {
            id: 'conversion',
            label: 'BITACORA CONVERSIÓN',
            icon: FileSpreadsheet,
            color: 'bg-indigo-500',
            desc: 'Bitácora de procesos de conversión y estados.',
            status: 'Solo Lectura'
        },
        {
            id: 'ordenes',
            label: 'BITACORA ORDENES DE TRABAJO',
            icon: FileText,
            color: 'bg-rose-500',
            desc: 'Historial completo de órdenes de trabajo cerradas.',
            status: 'Solo Lectura'
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">
                Bitácoras del Sistema
            </h2>
            <p className="text-[var(--text-muted)]">
                Acceso de consulta a los registros históricos del sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bitacoras.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className={`glass-panel p-6 relative overflow-hidden group hover:bg-white/5 transition-all border-t-4 border-transparent hover:border-t-purple-400 ${item.id === 'conversion' ? 'cursor-pointer hover:border-t-indigo-400' :
                                item.id === 'diecut' ? 'cursor-pointer hover:border-t-purple-400' :
                                    item.id === 'ordenes' ? 'cursor-pointer hover:border-t-rose-400' :
                                        'cursor-default opacity-80'
                                }`}
                            onClick={() => {
                                if (item.id === 'conversion') setLocation('/bitacoras/conversion');
                                if (item.id === 'diecut') setLocation('/bitacoras/diecut');
                                if (item.id === 'ordenes') setLocation('/bitacoras/ordenes');
                            }}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${item.color} bg-opacity-20 text-white shadow-lg`}>
                                <Icon size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                            <p className="text-sm text-slate-400 mb-4">{item.desc}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    ACCEDER →
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

