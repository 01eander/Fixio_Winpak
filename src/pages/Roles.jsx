import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Plus, X, Save, Edit, Trash2, Shield } from 'lucide-react';
import { Link } from 'wouter';

const API_URL = 'http://localhost:3001/api';

export default function Roles() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_URL}/roles`);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name });
        } else {
            setEditingItem(null);
            setFormData({ name: '' });
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
            const url = editingItem ? `${API_URL}/roles/${editingItem.id}` : `${API_URL}/roles`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchItems();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este rol?')) return;
        try {
            const response = await fetch(`${API_URL}/roles/${id}`, { method: 'DELETE' });
            if (response.ok) fetchItems();
            else alert('No se puede eliminar (posiblemente en uso)');
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Roles de Usuario</h2>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Nuevo</span>
                </button>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar rol..."
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
                            <th className="p-4 font-semibold">Rol</th>
                            <th className="p-4 font-semibold text-center w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="3" className="p-8 text-center text-[var(--text-muted)]">Cargando...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-[var(--text-muted)]">No hay registros</td></tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-[var(--text-muted)] font-mono text-xs">{item.id}</td>
                                    <td className="p-4 font-medium text-[var(--text-main)] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                            <Shield size={16} />
                                        </div>
                                        {item.name}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal - Same as Departments but could be abstracted */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingItem ? 'Editar' : 'Nuevo'}</h3>
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
                                    placeholder="Ej. Operador"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-glass)]">
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
