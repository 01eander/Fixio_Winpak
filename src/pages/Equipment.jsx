import React, { useState, useEffect } from 'react';
import { Search, Truck, ArrowLeft, Activity, QrCode, FileDown, Table, ChevronDown, ChevronRight, Box, Layers, Plus, X, Save, Edit, Trash2, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import QrModal from '../components/QrModal';

const API_URL = 'http://localhost:3001/api';

export default function Equipment() {
    const [areas, setAreas] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedQr, setSelectedQr] = useState(null);
    const [expandedIds, setExpandedIds] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        serial_number: '',
        category_id: '',
        status: 'ACTIVE',
        area_id: '',
        parent_id: '',
        is_component: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [areasRes, equipmentRes, catsRes] = await Promise.all([
                fetch(`${API_URL}/areas`),
                fetch(`${API_URL}/equipment`),
                fetch(`${API_URL}/asset-categories`)
            ]);

            let areasData = [];
            let equipmentData = [];

            if (areasRes.ok) {
                areasData = await areasRes.json();
                setAreas(areasData);
            }
            if (equipmentRes.ok) {
                equipmentData = await equipmentRes.json();
                setEquipment(equipmentData);
            }
            if (catsRes.ok) setCategories(await catsRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter and Sort Logic
    // 1. Filter by search
    // 2. Sort: Areas with equipment first, then alphabetical
    const filteredAreas = areas.filter(area =>
        area.name.toLowerCase().includes(search.toLowerCase()) ||
        equipment.some(e => e.area_id === area.id && (
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.model?.toLowerCase().includes(search.toLowerCase())
        ))
    ).sort((a, b) => {
        const hasEquipA = equipment.some(e => e.area_id === a.id);
        const hasEquipB = equipment.some(e => e.area_id === b.id);

        if (hasEquipA && !hasEquipB) return -1;
        if (!hasEquipA && hasEquipB) return 1;

        return a.name.localeCompare(b.name);
    });

    // Modal Handlers
    const handleOpenModal = (item = null, parentAreaId = null, parentComponentId = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                model: item.model || '',
                serial_number: item.serial_number || '',
                category_id: item.category_id || '',
                status: item.status,
                area_id: item.area_id || '',
                parent_id: item.parent_id || '',
                is_component: !!item.parent_id
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                model: '',
                serial_number: '',
                category_id: '',
                status: 'ACTIVE',
                area_id: parentAreaId || '',
                parent_id: parentComponentId || '',
                is_component: !!parentComponentId
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                ...formData,
                area_id: formData.is_component ? null : (formData.area_id || null),
                parent_id: formData.is_component ? (formData.parent_id || null) : null
            };

            const url = editingItem ? `${API_URL}/equipment/${editingItem.id}` : `${API_URL}/equipment`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchData();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving equipment:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este equipo/componente?')) return;
        try {
            const response = await fetch(`${API_URL}/equipment/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'No se puede eliminar');
            }
        } catch (error) {
            console.error('Error deleting equipment:', error);
        }
    };

    // Recursive Component Node
    const ComponentNode = ({ parentId, level = 0 }) => {
        const children = equipment.filter(e => e.parent_id === parentId);
        if (children.length === 0) return null;

        return (
            <div className={`flex flex-col ${level > 0 ? 'ml-6 pl-4 border-l border-[var(--border-glass)]' : ''}`}>
                {children.map(comp => {
                    const hasSubChildren = equipment.some(e => e.parent_id === comp.id);
                    const isExpanded = expandedIds[`comp-${comp.id}`];
                    // Only sub-explosion at level 0
                    const canExplode = level === 0 && hasSubChildren;

                    return (
                        <div key={comp.id} className="mt-2">
                            <div
                                className={`flex items-center gap-3 bg-[var(--bg-panel)]/50 p-2 rounded-lg border border-[var(--border-glass)] hover:bg-white/5 transition-colors group/comp ${canExplode ? 'cursor-pointer' : ''}`}
                                onClick={() => canExplode && toggleExpand(`comp-${comp.id}`)}
                            >
                                {canExplode ? (
                                    isExpanded ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)]" />
                                ) : (
                                    <div className="w-3.5" /> // Spacer for alignment
                                )}

                                {level === 0 ? (
                                    <Box size={16} className="text-blue-400" />
                                ) : (
                                    <Layers size={14} className="text-purple-400" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[var(--text-main)] flex items-center gap-2">
                                        {comp.name}
                                        <div className="flex gap-1 opacity-0 group-hover/comp:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(null, null, comp.id); }} className="p-1 hover:bg-blue-500/20 rounded text-blue-400" title="Agregar sub-componente">
                                                <Plus size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(comp); }} className="p-1 hover:bg-white/10 rounded text-yellow-400" title="Editar">
                                                <Edit size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(comp.id); }} className="p-1 hover:bg-white/10 rounded text-red-400" title="Eliminar">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </p>
                                    <div className="flex gap-3 text-xs text-[var(--text-muted)]">
                                        {comp.model && <span>Mod: {comp.model}</span>}
                                        {comp.serial_number && <span>SN: {comp.serial_number}</span>}
                                        <span className="text-[var(--primary)]">{comp.category_name}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Recursive call: if level 0, respect isExpanded. If level > 0, always show (as requested "only this level") */}
                            {(level > 0 || isExpanded) && <ComponentNode parentId={comp.id} level={level + 1} />}
                        </div>
                    );
                })}
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
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Nuevo Equipo</span>
                </button>
            </div>

            <div className="bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)] mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por área, equipo o modelo..."
                        className="pl-10 w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2 text-[var(--text-main)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center p-8 text-[var(--text-muted)]">Cargando jerarquía...</div>
                ) : filteredAreas.length === 0 ? (
                    <div className="text-center p-8 text-[var(--text-muted)]">No se encontraron equipos ni áreas.</div>
                ) : (
                    filteredAreas.map(area => {
                        const areaEquipments = equipment.filter(e => e.area_id === area.id);
                        if (areaEquipments.length === 0 && search) return null; // Hide empty areas if searching

                        return (
                            <div key={area.id} className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl overflow-hidden">
                                <div
                                    className="p-4 bg-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => toggleExpand(`area-${area.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-emerald-400" size={20} />
                                        <h3 className="text-lg font-bold text-white">{area.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-[var(--text-muted)]">
                                            {areaEquipments.length} Equipos
                                        </span>
                                    </div>
                                    {expandedIds[`area-${area.id}`] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>

                                {expandedIds[`area-${area.id}`] && (
                                    <div className="p-4 bg-black/20 border-t border-[var(--border-glass)] space-y-4 animate-in fade-in slide-in-from-top-2">
                                        {areaEquipments.length === 0 ? (
                                            <p className="text-center text-sm text-[var(--text-muted)] italic py-2">No hay equipos asignados a esta área.</p>
                                        ) : (
                                            areaEquipments.map(eq => (
                                                <div key={eq.id} className="border border-[var(--border-glass)] rounded-lg bg-[var(--bg-app)]/50 p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-1 p-2 bg-blue-500/10 rounded text-blue-400">
                                                                <Truck size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                                    {eq.name}
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${eq.status === 'ACTIVE' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                                                                        {eq.status}
                                                                    </span>
                                                                </h4>
                                                                <div className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-4 mt-1">
                                                                    <span>Modelo: {eq.model || 'N/A'}</span>
                                                                    <span>SN: {eq.serial_number || 'N/A'}</span>
                                                                    <span className="text-blue-300">{eq.category_name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setSelectedQr({ title: eq.name, value: `EQ-${eq.id}` })} className="p-1.5 hover:bg-white/10 rounded text-[var(--text-muted)] hover:text-white" title="QR">
                                                                <QrCode size={16} />
                                                            </button>
                                                            <button onClick={() => handleOpenModal(null, null, eq.id)} className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400" title="Agregar Componente">
                                                                <Plus size={16} />
                                                            </button>
                                                            <button onClick={() => handleOpenModal(eq)} className="p-1.5 hover:bg-yellow-500/20 rounded text-yellow-400" title="Editar">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(eq.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="Eliminar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Recursive Components */}
                                                    <div className="mt-3 pl-2">
                                                        <ComponentNode parentId={eq.id} />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <button
                                            onClick={() => handleOpenModal(null, area.id)}
                                            className="w-full py-2 border border-dashed border-[var(--border-glass)] rounded-lg text-sm text-[var(--text-muted)] hover:text-white hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Agregar Equipo en {area.name}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 p-6 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-white">
                                {editingItem ? 'Editar' : 'Nuevo'} {formData.is_component ? 'Componente' : 'Equipo'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
                            {/* Toggle Type if creating new root item */}
                            {!editingItem && !formData.area_id && !formData.parent_id && (
                                <div className="flex bg-black/20 p-1 rounded-lg mb-4">
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!formData.is_component ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-muted)] hover:text-white'}`}
                                        onClick={() => setFormData(p => ({ ...p, is_component: false }))}
                                    >
                                        Equipo Principal
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.is_component ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-muted)] hover:text-white'}`}
                                        onClick={() => setFormData(p => ({ ...p, is_component: true }))}
                                    >
                                        Sub-Componente
                                    </button>
                                </div>
                            )}

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
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Categoría</label>
                                    <select
                                        name="category_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
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
                                        <option value="MAINTENANCE">Mantenimiento</option>
                                        <option value="SCRAPPED">Desechado</option>
                                    </select>
                                </div>
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
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">No. Serie</label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.serial_number}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {!formData.is_component ? (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Ubicación (Área)</label>
                                    <select
                                        name="area_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.area_id}
                                        onChange={handleInputChange}
                                        disabled={!!formData.area_id && !editingItem} // Si ya viene pre-seteada al crear
                                    >
                                        <option value="">Seleccionar Área...</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Componente Padre</label>
                                    <select
                                        name="parent_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.parent_id}
                                        onChange={handleInputChange}
                                        disabled={!!formData.parent_id && !editingItem}
                                    >
                                        <option value="">Seleccionar Padre...</option>
                                        {equipment.map(eq => (
                                            <option key={eq.id} value={eq.id}>{eq.name} (SN: {eq.serial_number})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-glass)] flex-shrink-0">
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
