import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Target, Factory, FileDown, Table, ArrowLeft, Plus, X, Save, Edit, Trash2, Upload } from 'lucide-react';
import { Link } from 'wouter';

const API_URL = 'http://localhost:3000/api';

export default function Areas() {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        manager: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [areaCategoryId, setAreaCategoryId] = useState(null);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            // 1. Fetch Categories to find 'Área' ID
            const catResponse = await fetch(`${API_URL}/asset-categories`);
            let areaId = null;

            if (catResponse.ok) {
                const categories = await catResponse.json();
                const areaCat = categories.find(c => ['ÁREA', 'AREA'].includes(c.name.toUpperCase()));
                if (areaCat) {
                    setAreaCategoryId(areaCat.id);
                    areaId = areaCat.id;
                }
            }

            // 2. Fetch Assets using ID (preferred) or fallback to string
            const query = areaId ? `category_id=${areaId}` : 'category=AREA';
            const response = await fetch(`${API_URL}/assets?${query}`);

            if (response.ok) {
                const data = await response.json();
                setAreas(data);
            }
        } catch (error) {
            console.error('Error loading areas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.model || '',
                manager: ''
            });
            setSelectedImage(null);
        } else {
            setEditingItem(null);
            setFormData({ name: '', description: '', manager: '' });
            setSelectedImage(null);
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
                name: formData.name,
                category: 'AREA', // keeping string as fallback
                category_id: areaCategoryId,
                model: formData.description,
                status: editingItem ? editingItem.status : 'ACTIVE'
            };

            const url = editingItem ? `${API_URL}/assets/${editingItem.id}` : `${API_URL}/assets`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();

                // Upload image if selected
                if (selectedImage) {
                    const assetId = editingItem ? editingItem.id : data.id;
                    const imageFormData = new FormData();
                    imageFormData.append('image', selectedImage);

                    await fetch(`${API_URL}/assets/${assetId}/image`, {
                        method: 'POST',
                        body: imageFormData
                    });
                }

                fetchAreas();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving area:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta área?')) return;
        try {
            const response = await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' });
            if (response.ok) fetchAreas();
            else {
                const data = await response.json();
                alert(data.error || 'No se puede eliminar');
            }
        } catch (error) {
            console.error('Error deleting area:', error);
        }
    };

    const filteredItems = areas.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
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
                        className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 ml-2"
                        onClick={() => handleOpenModal()}
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
                        placeholder="Buscar área..."
                        className="pl-10 w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2 text-[var(--text-main)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center p-8 text-[var(--text-muted)]">Cargando áreas...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-3 text-center p-8 text-[var(--text-muted)]">No hay áreas registradas</div>
                ) : (
                    filteredItems.map((area) => (
                        <div key={area.id} className="glass-panel p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300 relative group">
                            <div className="h-32 overflow-hidden relative bg-[var(--bg-panel-dark)]">
                                {area.image_url ? (
                                    <img
                                        src={area.image_url.startsWith('http') ? area.image_url : `${API_URL}${area.image_url}`}
                                        alt={area.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                                        <Factory size={48} className="text-white/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] to-transparent"></div>
                                <div className="absolute bottom-3 left-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Factory size={20} className="text-[var(--primary)]" /> {area.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <p className="text-sm text-[var(--text-muted)] min-h-[40px]">
                                    {area.model || "Sin descripción"}
                                </p>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-muted)]/70 text-xs">Responsable</p>
                                            <p className="font-medium text-[var(--text-main)]">No Asignado</p>
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

                                <div className="flex justify-between gap-2 mt-2">
                                    <button
                                        onClick={() => handleOpenModal(area)}
                                        className="flex-1 btn-ghost p-2 text-sm text-blue-400 hover:bg-white/5 rounded transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Edit size={14} /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(area.id)}
                                        className="flex-1 btn-ghost p-2 text-sm text-red-400 hover:bg-white/5 rounded transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingItem ? 'Editar Área' : 'Nueva Área'}</h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre del Área</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all resize-none"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Imagen del Área</label>
                                <div className="border border-dashed border-[var(--border-glass)] rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setSelectedImage(e.target.files[0])}
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <Upload size={24} className="text-[var(--text-muted)]" />
                                        <span className="text-sm text-[var(--text-muted)]">
                                            {selectedImage ? selectedImage.name : 'Click para subir imagen'}
                                        </span>
                                    </div>
                                </div>
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
        </div>
    );
}
