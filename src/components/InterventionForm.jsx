import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Plus, X, Save } from 'lucide-react';
import { JOBS } from '../data/mockData';

export default function InterventionForm({ onClose }) {
    const { users, units, inventory, addIntervention } = useStore();

    const [formData, setFormData] = useState({
        unitId: '',
        operatorId: '',
        description: '',
        itemsUsed: []
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
        if (!selectedJob || !suggestedTool) return;

        const job = JOBS.find(j => j.id === parseInt(selectedJob));

        // Add the tool to itemsUsed (Borrowing logic)
        setFormData(prev => ({
            ...prev,
            description: prev.description ? `${prev.description}\n- ${job.name}` : `- ${job.name}`,
            itemsUsed: [...prev.itemsUsed, {
                itemId: suggestedTool.id,
                quantity: 1,
                name: suggestedTool.name,
                isTool: true
            }]
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
            unitId: parseInt(formData.unitId),
            operatorId: parseInt(formData.operatorId),
            description: formData.description,
            itemsUsed: formData.itemsUsed
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
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Unidad (Equipo)</label>
                            <select
                                required
                                value={formData.unitId}
                                onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                            >
                                <option value="">Seleccione Equipo...</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.model})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Operador</label>
                            <select
                                required
                                value={formData.operatorId}
                                onChange={e => setFormData({ ...formData, operatorId: e.target.value })}
                            >
                                <option value="">Seleccione Operador...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Descripción del Trabajo</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Detalle el trabajo realizado..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
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

                        {/* List of added items/tools */}
                        {formData.itemsUsed.length > 0 && (
                            <div className="space-y-2">
                                {formData.itemsUsed.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[var(--bg-panel)] p-2 rounded border border-[var(--border-glass)]">
                                        <span className="text-sm">{item.name} <span className="text-xs text-[var(--text-muted)]">(Herramienta)</span></span>
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
