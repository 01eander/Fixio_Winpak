import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { JOBS } from '../data/mockData';
import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Activity, AlertTriangle, Package, Calendar, Wrench, FileText, CheckCircle, Download } from 'lucide-react';

export default function Dashboard() {
    const { inventory, interventions, role } = useStore();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showPdfToast, setShowPdfToast] = useState(false);

    const handleDownloadReport = () => {
        setIsGeneratingPdf(true);
        // Simulate PDF generation delay
        setTimeout(() => {
            setIsGeneratingPdf(false);
            setShowPdfToast(true);
            setTimeout(() => setShowPdfToast(false), 3000); // Hide toast after 3s
        }, 1500);
    };

    const lowStockItems = inventory.filter(i => i.stock < 15 && i.isConsumable);
    const activeInterventions = interventions.length;
    const totalStockValue = inventory.reduce((acc, item) => acc + (item.stock * item.cost), 0);

    const stats = [
        { label: 'Ordenes de Servicio', value: activeInterventions, icon: Activity, color: 'text-blue-400' },
        { label: 'Alertas Stock', value: lowStockItems.length, icon: AlertTriangle, color: 'text-orange-400' },
        { label: 'Items en Catálogo', value: inventory.length, icon: Package, color: 'text-emerald-400' },
        { label: 'Valor Inventario', value: `$${totalStockValue.toLocaleString()}`, icon: Calendar, color: 'text-purple-400', restricted: true },
    ].filter(stat => !stat.restricted || role === 'ADMIN');

    // --- Chart Data Calculation ---

    // 1. Most Used Tools
    const toolUsage = {};
    interventions.forEach(inter => {
        inter.itemsUsed?.forEach(usage => {
            const itemDef = inventory.find(i => i.id === usage.itemId);
            // Check if tool: Explicit isTool flag, OR !isConsumable in inventory, OR "Tool"/"Herramienta" in name/category
            const isTool = usage.isTool ||
                (itemDef && !itemDef.isConsumable) ||
                (usage.name && usage.name.toLowerCase().includes('herramienta'));

            if (isTool) {
                const name = usage.name || itemDef?.name || 'Unknown Tool';
                toolUsage[name] = (toolUsage[name] || 0) + (usage.quantity || 1);
            }
        });
    });
    const toolsData = Object.entries(toolUsage)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    // 2. Mock Jobs Data (Since we parse descriptions or assume random for prototype if empty)
    // Real logic: Match description against Job Names
    const jobUsage = {};
    interventions.forEach(inter => {
        const desc = inter.description.toLowerCase();
        let matched = false;
        JOBS.forEach(job => {
            if (desc.includes(job.name.toLowerCase())) {
                jobUsage[job.name] = (jobUsage[job.name] || 0) + 1;
                matched = true;
            }
        });
        if (!matched) {
            // Fallback for generic descriptions
            jobUsage['Otros Mantenimientos'] = (jobUsage['Otros Mantenimientos'] || 0) + 1;
        }
    });
    const jobsData = Object.entries(jobUsage)
        .filter(([name, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6 relative">
            {/* PDF Toast Notification */}
            {showPdfToast && (
                <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom duration-300">
                    <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Reporte Generado</h4>
                        <p className="text-sm opacity-90">El archivo PDF se ha descargado correctamente.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gradient">Dashboard General</h2>
                <button
                    onClick={handleDownloadReport}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-glass)] rounded-lg text-sm font-medium transition-all"
                >
                    {isGeneratingPdf ? (
                        <>
                            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                            <span>Generando...</span>
                        </>
                    ) : (
                        <>
                            <Download size={18} className="text-[var(--primary)]" />
                            <span>Descargar Reporte Mes</span>
                        </>
                    )}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="glass-panel p-6 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 cursor-default border-t-4 border-t-transparent hover:border-t-[var(--primary)]">
                            <div>
                                <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] ${stat.color} shadow-inner`}>
                                <Icon size={32} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Tools Chart */}
                <div className="glass-panel p-6 flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Wrench size={18} className="text-[var(--success)]" />
                        Herramientas Más Usadas
                    </h3>
                    <div className="h-64 w-full min-w-0" style={{ minHeight: '250px' }}>
                        {toolsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={toolsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {toolsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                                Sin datos suficientes
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Jobs Chart */}
                <div className="glass-panel p-6 flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-[var(--primary)]" />
                        Trabajos Recuentes
                    </h3>
                    <div className="h-64 w-full min-w-0" style={{ minHeight: '250px' }}>
                        {jobsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={jobsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {jobsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                                Sin datos suficientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-[var(--primary)]" />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-4">
                        {interventions.slice(0, 5).map((inter) => (
                            <div key={inter.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-[var(--border-glass)] transition-all">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-glass)]">
                                    <span className="font-bold text-xs">{inter.unitId}</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-[var(--text-main)]">{inter.description}</h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {new Date(inter.date).toLocaleDateString()} • ID: #{inter.id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-[var(--warning)]" />
                        Stock Crítico
                    </h3>
                    <div className="space-y-3">
                        {lowStockItems.length === 0 ? (
                            <p className="text-[var(--text-muted)]">Todo en orden.</p>
                        ) : (
                            lowStockItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[var(--danger)]"></div>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-[var(--danger)] font-bold">{item.stock} un.</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
