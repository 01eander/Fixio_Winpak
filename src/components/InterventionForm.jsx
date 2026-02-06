import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Plus, X, Save } from 'lucide-react';
import { JOBS } from '../data/mockData';

export default function InterventionForm({ onClose }) {
    const { users, units, inventory, addIntervention } = useStore();

    const [formData, setFormData] = useState({
        // Excel Columns Mapping:
        // Folio (Auto), Fecha (Auto)
        orderType: 'CORRECTIVE', // Tipo de Orden
        area: '',                // Area
        unitId: '',             // Maquina
        activityType: 'MECHANIC',// Tipo de Actividad
        description: '',        // Descripcion
        operatorId: '',         // Empleado (Solicitante)
        technicianId: '',       // Atendida por
        targetDate: '',         // CLOSE TARGET
        activities: [],          // List of job names added
        itemsUsed: []           // Refaccion requerida / Actividades
    });

    const [selectedJob, setSelectedJob] = useState('');
    const [suggestedTool, setSuggestedTool] = useState(null);

    // Filter tools from inventory for suggestions
    const tools = inventory.filter(i => !i.isConsumable);

    const handleJobChange = (e) => {
        const jobId = e.target.value;
        setSelectedJob(jobId);

        if (jobId) {
            // "Invent" a required tool based on job ID (deterministic mock)
            const randomToolIndex = jobId % tools.length;
            setSuggestedTool(tools[randomToolIndex]);
        } else {
            setSuggestedTool(null);
        }
    };

    const handleAddJob = () => {
        if (!selectedJob) return;

        const job = JOBS.find(j => j.id === parseInt(selectedJob));

        // 1. Add to Activities List
        const newActivities = [...formData.activities, job.name];

        // 2. Add Tool/Item logic
        let newItemsUsed = [...formData.itemsUsed];

        if (suggestedTool) {
            const existingItemIndex = newItemsUsed.findIndex(i => i.itemId === suggestedTool.id);

            if (existingItemIndex >= 0) {
                // Item exists
                if (suggestedTool.isConsumable) {
                    // Sum quantity for consumables
                    newItemsUsed[existingItemIndex] = {
                        ...newItemsUsed[existingItemIndex],
                        quantity: newItemsUsed[existingItemIndex].quantity + 1
                    };
                } else {
                    // Do NOT sum for tools (keep unique instance logic, or just ensure it's there)
                    // "Las herramientas iguales... no se suman". We leave it as is (quantity 1).
                }
            } else {
                // New item
                newItemsUsed.push({
                    itemId: suggestedTool.id,
                    quantity: 1,
                    name: suggestedTool.name,
                    isTool: !suggestedTool.isConsumable
                });
            }
        }

        setFormData(prev => ({
            ...prev,
            activities: newActivities,
            // Keep description in sync or independent? User asked to "save jobs". 
            // We'll append to description for now to maintain compatibility with view, 
            // but we have the structured 'activities' array too.
            description: prev.description ? `${prev.description}\n- ${job.name}` : `- ${job.name}`,
            itemsUsed: newItemsUsed
        }));

        setSelectedJob('');
        setSuggestedTool(null);
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            itemsUsed: prev.itemsUsed.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.unitId || !formData.operatorId || !formData.description) return;

        addIntervention({
            ...formData, // Spread all new fields
            unitId: parseInt(formData.unitId),
            operatorId: parseInt(formData.operatorId)
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-[var(--border-glass)] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gradient">Nueva Orden de Servicio</h2>
                    <button onClick={onClose} className="hover:text-[var(--danger)]"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Tipo de Orden */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Tipo de Orden</label>
                            <select
                                required
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.orderType}
                                onChange={e => setFormData({ ...formData, orderType: e.target.value })}
                            >
                                <option value="CORRECTIVE">CORRECTIVE</option>
                                <option value="PREVENTIVE">PREVENTIVE</option>
                                <option value="IMPROVEMENT">IMPROVEMENT</option>
                            </select>
                        </div>

                        {/* 2. Area */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Área</label>
                            <select
                                required
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.area}
                                onChange={e => setFormData({ ...formData, area: e.target.value })}
                            >
                                <option value="">Seleccione Área...</option>
                                <option value="PRINTING">PRINTING</option>
                                <option value="DIE CUT">DIE CUT</option>
                                <option value="BUILDING">BUILDING</option>
                                <option value="LAMINATION">LAMINATION</option>
                                <option value="WAREHOUSE">WAREHOUSE</option>
                            </select>
                        </div>

                        {/* 3. Maquina (Unit) */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Máquina</label>
                            <select
                                required
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.unitId}
                                onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                            >
                                <option value="">Seleccione Equipo...</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.model})</option>)}
                            </select>
                        </div>

                        {/* 4. Tipo de Actividad */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Tipo de Actividad</label>
                            <select
                                required
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.activityType}
                                onChange={e => setFormData({ ...formData, activityType: e.target.value })}
                            >
                                <option value="MECHANIC">MECHANIC</option>
                                <option value="ELECTRIC">ELECTRIC</option>
                                <option value="HYDRAULIC">HYDRAULIC</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>

                        {/* 5. Descripcion (Full Width) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Descripción</label>
                            <textarea
                                required
                                rows="3"
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                placeholder="Detalle el trabajo realizado..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* 6. Empleado (Reporting User) */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Empleado (Solicitante)</label>
                            <select
                                required
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.operatorId}
                                onChange={e => setFormData({ ...formData, operatorId: e.target.value })}
                            >
                                <option value="">Seleccione Empleado...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>

                        {/* 7. Atendida por (Technician) */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Atendida por</label>
                            <select
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.technicianId}
                                onChange={e => setFormData({ ...formData, technicianId: e.target.value })}
                            >
                                <option value="">Seleccione Técnico...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>

                        {/* 8. Close Target */}
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Fecha Compromiso (Close Target)</label>
                            <input
                                type="date"
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded p-2 text-sm"
                                value={formData.targetDate}
                                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="glass-panel p-4 bg-[var(--bg-app)]">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Plus size={16} /> Agregar Trabajo
                        </h3>

                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex gap-2">
                                <select
                                    className="flex-1"
                                    value={selectedJob}
                                    onChange={handleJobChange}
                                >
                                    <option value="">Seleccione Trabajo...</option>
                                    {JOBS.map(j => (
                                        <option key={j.id} value={j.id}>
                                            {j.name} ({j.type})
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleAddJob} className="btn-primary px-3">
                                    <Plus size={20} />
                                </button>
                            </div>

                            {suggestedTool && (
                                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">
                                    <span className="font-bold">Herramienta Necesaria:</span>
                                    <span>{suggestedTool.name}</span>
                                </div>
                            )}
                        </div>

                        {/* List of Activities */}
                        {formData.activities.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase">Actividades Agregadas</h4>
                                {formData.activities.map((act, idx) => (
                                    <div key={idx} className="bg-[var(--bg-panel)] p-2 rounded border border-[var(--border-glass)] text-sm">
                                        {act}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List of added items/tools */}
                        {formData.itemsUsed.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase">Recursos / Herramientas</h4>
                                {formData.itemsUsed.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[var(--bg-panel)] p-2 rounded border border-[var(--border-glass)]">
                                        <span className="text-sm">{item.name} <span className="text-xs text-[var(--text-muted)]">({item.isTool ? 'Herramienta' : 'Consumible'})</span></span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-[var(--text-accent)]">x{item.quantity}</span>
                                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-[var(--danger)] hover:bg-white/10 p-1 rounded">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-[var(--text-muted)] hover:bg-white/5">Cancelar</button>
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Save size={18} /> Guardar Orden
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
