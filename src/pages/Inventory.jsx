import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, QrCode, FileDown, Plus, X, Save, Edit, Trash2, MapPin, Tag, Package, Warehouse } from 'lucide-react';
import { Link } from 'wouter';
import QrModal from '../components/QrModal';

const API_URL = 'http://localhost:3000/api';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [selectedQr, setSelectedQr] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [stockDetails, setStockDetails] = useState([]); // For edit mode: [{ warehouse_id, warehouse_name, quantity, location_in_warehouse }]

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        min_stock: 0,
        unit_cost: 0,
        // For creation only
        initial_warehouse_id: '',
        initial_quantity: 0,
        initial_location: ''
    });

    useEffect(() => {
        fetchInventory();
        fetchCategories();
        fetchWarehouses();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_URL}/inventory`);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/inventory-categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await fetch(`${API_URL}/warehouses`);
            if (response.ok) {
                setWarehouses(await response.json());
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const fetchStockDetails = async (itemId) => {
        try {
            const response = await fetch(`${API_URL}/inventory/${itemId}/stock`);
            if (response.ok) {
                setStockDetails(await response.json());
            }
        } catch (error) {
            console.error('Error fetching stock details:', error);
        }
    };

    const handleOpenModal = async (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                sku: item.sku || '',
                name: item.name || '',
                description: item.description || '',
                category_id: item.category_id || '',
                min_stock: item.min_stock || 0,
                unit_cost: item.unit_cost || 0,
                initial_warehouse_id: '',
                initial_quantity: 0,
                initial_location: ''
            });
            await fetchStockDetails(item.id);
        } else {
            setEditingItem(null);
            setStockDetails([]);
            setFormData({
                sku: '',
                name: '',
                description: '',
                category_id: '',
                min_stock: 0,
                unit_cost: 0,
                initial_warehouse_id: '',
                initial_quantity: 0,
                initial_location: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setStockDetails([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStockChange = (index, field, value) => {
        const updated = [...stockDetails];
        updated[index][field] = value;
        setStockDetails(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem ? `${API_URL}/inventory/${editingItem.id}` : `${API_URL}/inventory`;
            const method = editingItem ? 'PUT' : 'POST';

            // Clean up numbers
            const payload = {
                ...formData,
                min_stock: Number(formData.min_stock),
                unit_cost: Number(formData.unit_cost),
                initial_quantity: Number(formData.initial_quantity)
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // If editing, also save stock details
                if (editingItem && stockDetails.length > 0) {
                    await Promise.all(stockDetails.map(stock =>
                        fetch(`${API_URL}/inventory/${editingItem.id}/stock`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                warehouse_id: stock.warehouse_id,
                                quantity: Number(stock.quantity),
                                location_in_warehouse: stock.location_in_warehouse
                            })
                        })
                    ));
                }

                fetchInventory();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de desactivar este item?')) return;
        try {
            const response = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
            if (response.ok) fetchInventory();
            else alert('Error al eliminar');
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'ALL' || (item.category_name && item.category_name.toUpperCase().includes(filter));
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Inventario Unificado</h2>
                </div>
                <div className="flex gap-2">
                    <Link href="/inventory/audit">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                            <Package size={18} />
                            <span>Inventario Cíclico</span>
                        </button>
                    </Link>

                    <button className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors" title="Descargar PDF">
                        <FileDown size={20} />
                    </button>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus size={18} />
                        <span>Insertar Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar item o SKU..."
                            className="pl-10 w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2 text-[var(--text-main)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-glass)] bg-white/5 text-[var(--text-muted)] text-sm uppercase">
                            <th className="p-4 font-semibold">SKU</th>
                            <th className="p-4 font-semibold">Item</th>
                            <th className="p-4 font-semibold">Categoría</th>
                            <th className="p-4 font-semibold text-right">Existencia Total</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">Cargando inventario...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No se encontraron items.</td></tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-[var(--text-muted)] font-mono text-sm">{item.sku}</td>
                                    <td className="p-4 font-medium text-[var(--text-main)]">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{item.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                                            <Tag size={12} /> {item.category_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-bold ${item.stock < item.min_stock ? 'text-[var(--danger)]' : 'text-[var(--text-main)]'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button onClick={() => setSelectedQr({ title: item.name, value: `ITEM-${item.sku}` })} className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400" title="Ver QR">
                                            <QrCode size={18} />
                                        </button>
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400" title="Eliminar">
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
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingItem ? 'Editar Item' : 'Nuevo Item'}</h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* General Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">SKU</label>
                                    <input type="text" name="sku" required className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.sku} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Categoría</label>
                                    <select name="category_id" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.category_id} onChange={handleInputChange}>
                                        <option value="">Seleccionar Categoría</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre</label>
                                <input type="text" name="name" required className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Descripción</label>
                                <textarea name="description" rows="2" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white resize-none" value={formData.description} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Min. Stock</label>
                                    <input type="number" name="min_stock" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.min_stock} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Costo Unit.</label>
                                    <input type="number" step="0.01" name="unit_cost" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white" value={formData.unit_cost} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Stock Management Section */}
                            <div className="border-t border-[var(--border-glass)] pt-4">
                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Warehouse size={18} /> Control de Almacenes
                                </h4>

                                {!editingItem ? (
                                    // Creation Mode: Initial Assignment
                                    <div className="bg-white/5 p-4 rounded-lg border border-[var(--border-glass)]">
                                        <p className="text-sm text-[var(--text-muted)] mb-3">Asignación inicial de existencias (Opcional)</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)]">Almacén</label>
                                                <select name="initial_warehouse_id" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded text-sm p-2 text-white" value={formData.initial_warehouse_id} onChange={handleInputChange}>
                                                    <option value="">Ninguno</option>
                                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)]">Cantidad</label>
                                                <input type="number" name="initial_quantity" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded text-sm p-2 text-white" value={formData.initial_quantity} onChange={handleInputChange} disabled={!formData.initial_warehouse_id} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--text-muted)]">Ubicación (Estante/Bin)</label>
                                                <input type="text" name="initial_location" className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded text-sm p-2 text-white" value={formData.initial_location} onChange={handleInputChange} disabled={!formData.initial_warehouse_id} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Edit Mode: Multi-warehouse management
                                    <div className="bg-white/5 rounded-lg border border-[var(--border-glass)] overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/10 text-[var(--text-muted)]">
                                                <tr>
                                                    <th className="p-3">Almacén</th>
                                                    <th className="p-3 w-24">Cantidad</th>
                                                    <th className="p-3">Ubicación</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border-glass)]">
                                                {stockDetails.map((line, index) => (
                                                    <tr key={line.warehouse_id}>
                                                        <td className="p-3 font-medium text-white">{line.warehouse_name}</td>
                                                        <td className="p-3">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded p-1 text-center text-white"
                                                                value={line.quantity}
                                                                onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded p-1 text-white"
                                                                placeholder="Ej. A-12"
                                                                value={line.location_in_warehouse}
                                                                onChange={(e) => handleStockChange(index, 'location_in_warehouse', e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {stockDetails.length === 0 && (
                                                    <tr><td colSpan="3" className="p-4 text-center text-[var(--text-muted)]">No hay almacenes registrados.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-white/5 transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                                    <Save size={16} /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedQr && <QrModal title={selectedQr.title} value={selectedQr.value} onClose={() => setSelectedQr(null)} />}
        </div>
    );
}
