import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, ArrowLeft, Clock, FileDown, Table, Plus, X, Save, Edit, Trash2, Wrench, Package } from 'lucide-react';
import { Link } from 'wouter';

const API_URL = 'http://localhost:3000/api';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [availableTools, setAvailableTools] = useState([]); // Filtered assets
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [jobTools, setJobTools] = useState([]); // Tools assigned to current job

    // Tool selection state within modal
    const [selectedToolId, setSelectedToolId] = useState('');
    const [toolQuantity, setToolQuantity] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        type: 'General',
        estimated_time: 0,
        base_cost: 0
    });

    useEffect(() => {
        fetchJobs();
        fetchTools();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_URL}/maintenance-tasks`);
            if (response.ok) {
                setJobs(await response.json());
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTools = async () => {
        try {
            // 1. Find the Category ID for 'Herramienta'
            const catResponse = await fetch(`${API_URL}/asset-categories`);
            let toolCategoryId = null;

            if (catResponse.ok) {
                const categories = await catResponse.json();
                // Find ID for tool category
                const toolCat = categories.find(c => ['HERRAMIENTA', 'TOOLS', 'HERRAMIENTAS'].includes(c.name.toUpperCase()));
                if (toolCat) toolCategoryId = toolCat.id;
            }

            // 2. Fetch Assets filtering by that ID
            if (toolCategoryId) {
                const response = await fetch(`${API_URL}/assets?category_id=${toolCategoryId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableTools(data);
                }
            } else {
                console.warn('Category "Herramienta" not found in catalog.');
                setAvailableTools([]);
            }
        } catch (error) {
            console.error('Error fetching tools:', error);
            setAvailableTools([]);
        }
    };

    const fetchJobTools = async (jobId) => {
        try {
            const response = await fetch(`${API_URL}/maintenance-tasks/${jobId}/tools`);
            if (response.ok) {
                setJobTools(await response.json());
            }
        } catch (error) {
            console.error('Error fetching job tools:', error);
        }
    };

    const handleOpenModal = async (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                type: item.type || 'General',
                estimated_time: item.estimated_time || 0,
                base_cost: item.base_cost || 0
            });
            await fetchJobTools(item.id);
        } else {
            setEditingItem(null);
            setJobTools([]);
            setFormData({
                name: '',
                type: 'General',
                estimated_time: 0,
                base_cost: 0
            });
        }
        setSelectedToolId('');
        setToolQuantity(1);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setJobTools([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTool = () => {
        if (!selectedToolId) return;
        const tool = availableTools.find(t => t.id === Number(selectedToolId));
        if (!tool) return;

        // Check if already added
        if (jobTools.some(t => t.asset_id === tool.id)) {
            alert('Esta herramienta ya está agregada.');
            return;
        }

        setJobTools(prev => [...prev, {
            asset_id: tool.id,
            name: tool.name,
            model: tool.model,
            quantity: Number(toolQuantity)
        }]);

        setSelectedToolId('');
        setToolQuantity(1);
    };

    const handleRemoveTool = (assetId) => {
        setJobTools(prev => prev.filter(t => t.asset_id !== assetId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem ? `${API_URL}/maintenance-tasks/${editingItem.id}` : `${API_URL}/maintenance-tasks`;
            const method = editingItem ? 'PUT' : 'POST';

            // First save the job
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const savedJob = await response.json();
                const jobId = editingItem ? editingItem.id : savedJob.id;

                // Then save tools
                await fetch(`${API_URL}/maintenance-tasks/${jobId}/tools`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tools: jobTools })
                });

                fetchJobs();
                handleCloseModal();
            } else {
                alert('Error al guardar el trabajo');
            }
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este trabajo?')) return;
        try {
            const response = await fetch(`${API_URL}/maintenance-tasks/${id}`, { method: 'DELETE' });
            if (response.ok) fetchJobs();
            else alert('No se puede eliminar');
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const filteredItems = jobs.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Trabajos</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus size={18} />
                        <span>Insertar Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar trabajo..."
                        className="pl-10 w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2 text-[var(--text-main)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-glass)] bg-white/5 text-[var(--text-muted)] text-sm uppercase">
                            <th className="p-4 w-16">ID</th>
                            <th className="p-4 font-semibold">Tarea / Trabajo</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 font-semibold text-center">Tiempo Est.</th>
                            <th className="p-4 font-semibold text-right">Costo Base</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">Cargando...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No hay registros</td></tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-[var(--text-muted)] font-mono text-xs">{item.id}</td>
                                    <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                            <ClipboardList size={16} />
                                        </div>
                                        {item.name}
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs">{item.type}</span>
                                    </td>
                                    <td className="p-4 text-center flex items-center justify-center gap-2 text-[var(--text-muted)]">
                                        <Clock size={14} /> {item.estimated_time}h
                                    </td>
                                    <td className="p-4 text-right text-[var(--text-muted)]">
                                        {item.base_cost > 0 ? `$${item.base_cost}` : '-'}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingItem ? 'Editar Trabajo' : 'Nuevo Trabajo'}</h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre Tarea</label>
                                <input type="text" name="name" required className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tipo</label>
                                <select name="type" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.type} onChange={handleInputChange}>
                                    <option value="General">General</option>
                                    <option value="Preventivo">Preventivo</option>
                                    <option value="Correctivo">Correctivo</option>
                                    <option value="Predictivo">Predictivo</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Tiempo Est. (Hrs)</label>
                                    <input type="number" step="0.5" name="estimated_time" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.estimated_time} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Costo Base ($)</label>
                                    <input type="number" step="0.01" name="base_cost" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.base_cost} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Tools Section */}
                            <div className="border-t border-[var(--border-glass)] pt-4">
                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Wrench size={18} /> Herramientas Necesarias
                                </h4>

                                <div className="bg-white/5 p-4 rounded-lg border border-[var(--border-glass)] mb-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Herramienta</label>
                                            <select
                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded text-sm p-2 text-white"
                                                value={selectedToolId}
                                                onChange={(e) => setSelectedToolId(e.target.value)}
                                            >
                                                <option value="">Seleccionar Herramienta...</option>
                                                {availableTools.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} - {t.model}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <label className="text-xs text-[var(--text-muted)] block mb-1">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded text-sm p-2 text-white"
                                                value={toolQuantity}
                                                onChange={(e) => setToolQuantity(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddTool}
                                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* List of added tools */}
                                {jobTools.length > 0 ? (
                                    <div className="bg-white/5 rounded-lg border border-[var(--border-glass)] overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/10 text-[var(--text-muted)]">
                                                <tr>
                                                    <th className="p-3">Herramienta</th>
                                                    <th className="p-3 w-20 text-center">Cant.</th>
                                                    <th className="p-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border-glass)]">
                                                {jobTools.map((tool) => (
                                                    <tr key={tool.asset_id}>
                                                        <td className="p-3 text-white">
                                                            <div>{tool.name}</div>
                                                            <div className="text-xs text-[var(--text-muted)]">{tool.model}</div>
                                                        </td>
                                                        <td className="p-3 text-center">{tool.quantity}</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTool(tool.asset_id)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)] text-center italic">No se han asignado herramientas.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-white/5 transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"><Save size={16} /> Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
