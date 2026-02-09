import React, { useState, useEffect } from 'react';
import { Search, Truck, ArrowLeft, Activity, QrCode, FileDown, Table, ChevronDown, ChevronRight, Box, Layers, Plus, X, Save, Edit, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import QrModal from '../components/QrModal';

const API_URL = 'http://localhost:3000/api';

export default function Equipment() {
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedQr, setSelectedQr] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        serial_number: '',
        category_id: '',
        status: 'ACTIVE',
        parent_id: ''
    });

    useEffect(() => {
        fetchAssets();
        fetchCategories();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await fetch(`${API_URL}/assets`);
            if (response.ok) {
                const data = await response.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/asset-categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const toggleExpand = (id) => {
        setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Derived lists
    // Filter out 'AREA' category assets for parent selection (keep them if they are parent candidates)
    // Actually, Areas ARE valid parents.
    // We should filter 'category' string or 'category_name' from join.
    // The API now returns category_name.
    // I need to know which assets are 'AREA' type. I'll rely on category_name or use a known ID if I had it.
    // For now, I'll display all assets as potential parents except itself.

    // I will try to identify Areas by name or if category_name is 'Área' or 'Area'
    const areas = assets.filter(a => a.category === 'AREA' || a.category_name?.toUpperCase() === 'ÁREA' || a.category_name?.toUpperCase() === 'AREA');
    const units = assets.filter(a => !areas.includes(a)); // Everything else

    const filteredItems = units.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.model && item.model.toLowerCase().includes(search.toLowerCase()))
    );

    // Modal Handlers
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                model: item.model || '',
                serial_number: item.serial_number || '',
                category_id: item.category_id || '',
                status: item.status,
                parent_id: item.parent_id || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                model: '',
                serial_number: '',
                category_id: '',
                status: 'ACTIVE',
                parent_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                ...formData,
                parent_id: formData.parent_id || null
            };

            const url = editingItem ? `${API_URL}/assets/${editingItem.id}` : `${API_URL}/assets`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchAssets();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving asset:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este equipo?')) return;
        try {
            const response = await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' });
            if (response.ok) fetchAssets();
            else {
                const data = await response.json();
                alert(data.error || 'No se puede eliminar');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    // Recursive component to render hierarchy
    const ComponentNode = ({ unitId, level = 0 }) => {
        const childComponents = assets.filter(c => c.parent_id === unitId);

        if (childComponents.length === 0) return null;

        return (
            <div className={`flex flex-col ${level > 0 ? 'ml-6 border-l border-[var(--border-glass)] pl-4' : ''}`}>
                {childComponents.map(comp => (
                    <div key={comp.id} className="mt-2">
                        <div className="flex items-center gap-3 bg-[var(--bg-panel)] p-2 rounded-lg border border-[var(--border-glass)] hover:bg-white/5 transition-colors group/comp">
                            <Box size={16} className="text-[var(--primary)]" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--text-main)] flex items-center gap-2">
                                    {comp.name}
                                    <button onClick={() => handleOpenModal(comp)} className="p-1 hover:bg-white/10 rounded text-blue-400 invisible group-hover/comp:visible" title="Editar">
                                        <Edit size={12} />
                                    </button>
                                    <button onClick={() => handleDelete(comp.id)} className="p-1 hover:bg-white/10 rounded text-red-400 invisible group-hover/comp:visible" title="Eliminar">
                                        <Trash2 size={12} />
                                    </button>
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {comp.model ? `Model: ${comp.model}` : ''}
                                    {comp.serial_number ? ` | SN: ${comp.serial_number}` : ''}
                                </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-white/5 rounded text-[var(--text-muted)]">
                                {comp.category_name || comp.category}
                            </span>
                        </div>
                        {/* Recursive call for children */}
                        <ComponentNode unitId={comp.id} level={level + 1} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Catálogo de Equipos</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
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
                        placeholder="Buscar equipo..."
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
                            <th className="p-4 w-10"></th>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Equipo</th>
                            <th className="p-4 font-semibold">Modelo</th>
                            <th className="p-4 font-semibold">Ubicación / Padre</th>
                            <th className="p-4 font-semibold">Categoría</th>
                            <th className="p-4 font-semibold text-center">Estado</th>
                            <th className="p-4 font-semibold text-center flex gap-2 justify-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">Cargando equipos...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">No se encontraron equipos</td></tr>
                        ) : (
                            filteredItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleExpand(item.id)}
                                                className="text-[var(--text-muted)] hover:text-white transition-colors"
                                            >
                                                {expandedUnits[item.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-[var(--text-muted)] font-mono text-sm">#{item.id}</td>
                                        <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                                <Truck size={20} />
                                            </div>
                                            {item.name}
                                        </td>
                                        <td className="p-4 text-[var(--text-muted)]">{item.model || 'N/A'}</td>
                                        <td className="p-4 text-[var(--text-muted)]">
                                            {/* Show parent name */}
                                            {assets.find(a => a.id === item.parent_id)?.name || 'Sin asignar'}
                                        </td>
                                        <td className="p-4 text-[var(--text-muted)]">
                                            <span className="px-2 py-1 bg-white/5 rounded text-xs">
                                                {item.category_name || item.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                <Activity size={12} /> {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedQr({ title: item.name, value: `UNIT-${item.id}` })}
                                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                                title="Ver QR"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Expanded Row for Components */}
                                    {expandedUnits[item.id] && (
                                        <tr className="bg-black/20 animate-in fade-in duration-200">
                                            <td colSpan="8" className="p-4 pl-16">
                                                <div className="flex items-center gap-2 mb-3 text-[var(--text-muted)]">
                                                    <Layers size={16} />
                                                    <span className="text-sm font-semibold uppercase tracking-wider">Estructura de Componentes</span>
                                                </div>
                                                <div className="bg-[var(--bg-app)]/50 rounded-xl p-4 border border-[var(--border-glass)]">
                                                    <ComponentNode unitId={item.id} />
                                                    {/* Check if no children */}
                                                    {assets.filter(c => c.parent_id === item.id).length === 0 && (
                                                        <p className="text-sm text-[var(--text-muted)] italic">No hay componentes registrados.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingItem ? 'Editar Equipo/Componente' : 'Nuevo Equipo'}</h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        name="model"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Número de Serie</label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.serial_number}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Categoría</label>
                                    <select
                                        name="category_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccionar Categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Padre / Ubicación</label>
                                    <select
                                        name="parent_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.parent_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Raíz (Principal)</option>
                                        <optgroup label="Áreas">
                                            {areas.map(area => (
                                                <option key={area.id} value={area.id}>{area.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Equipos">
                                            {units.filter(u => u.id !== editingItem?.id).map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Estado</label>
                                <select
                                    name="status"
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="ACTIVE">Activo</option>
                                    <option value="INACTIVE">Inactivo</option>
                                    <option value="MAINTENANCE">En Mantenimiento</option>
                                    <option value="SCRAPPED">Desechado</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-glass)]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
