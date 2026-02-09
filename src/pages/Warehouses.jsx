import React, { useState, useEffect } from 'react';
import { Search, Warehouse, MapPin, ArrowLeft, Shield, Plus, X, Save, Edit, Trash2, ClipboardCheck, PackageSearch, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { Link } from 'wouter';

const API_URL = 'http://localhost:3000/api';

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', area_id: '', is_personal: false });

    // Surtir Orden states
    const [isSurtirModalOpen, setIsSurtirModalOpen] = useState(false);
    const [surtirStep, setSurtirStep] = useState(1); // 1: Input, 2: Tool List
    const [mechanics, setMechanics] = useState([]);
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [workOrderId, setWorkOrderId] = useState('');
    const [requiredTools, setRequiredTools] = useState([]);
    const [toolStatuses, setToolStatuses] = useState({});
    const [selectingWarehouseFor, setSelectingWarehouseFor] = useState(null);

    useEffect(() => {
        fetchWarehouses();
        fetchAreas();
        fetchMechanics();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch(`${API_URL}/warehouses`);
            if (response.ok) {
                const data = await response.json();
                setWarehouses(data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await fetch(`${API_URL}/assets`);
            if (response.ok) {
                const data = await response.json();
                const areaAssets = data.filter(a =>
                    a.category === 'AREA' ||
                    (a.category_name && (a.category_name.toUpperCase() === 'ÁREA' || a.category_name.toUpperCase() === 'AREA'))
                );
                setAreas(areaAssets);
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchMechanics = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (response.ok) {
                const data = await response.json();
                // Filter users with Mantenimiento department or role
                const mechanicUsers = data.filter(u =>
                    (u.department_name && u.department_name.toUpperCase().includes('MANTENIMIENTO')) ||
                    (u.role_name && (u.role_name.toUpperCase().includes('TÉCNICO') || u.role_name.toUpperCase().includes('TECNICO')))
                );
                setMechanics(mechanicUsers);
            }
        } catch (error) {
            console.error('Error fetching mechanics:', error);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, area_id: item.area_id || '', is_personal: item.is_personal || false });
        } else {
            setEditingItem(null);
            setFormData({ name: '', area_id: '', is_personal: false });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem ? `${API_URL}/warehouses/${editingItem.id}` : `${API_URL}/warehouses`;
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchWarehouses();
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este almacén?')) return;
        try {
            const response = await fetch(`${API_URL}/warehouses/${id}`, { method: 'DELETE' });
            if (response.ok) fetchWarehouses();
            else alert('No se puede eliminar');
        } catch (error) {
            console.error('Error deleting warehouse:', error);
        }
    };

    // Surtir Orden functions
    const handleOpenSurtirModal = () => {
        setIsSurtirModalOpen(true);
        setSurtirStep(1);
        setSelectedMechanic(null);
        setWorkOrderId('');
        setRequiredTools([]);
        setToolStatuses({});
    };

    const handleCloseSurtirModal = () => {
        setIsSurtirModalOpen(false);
        setSelectingWarehouseFor(null);
    };

    const handleSearchWorkOrder = async () => {
        if (!selectedMechanic || !workOrderId) {
            alert('Por favor selecciona un mecánico e ingresa el ID de la orden');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/work-orders/${workOrderId}/requirements`);
            if (!response.ok) {
                alert('Orden de trabajo no encontrada');
                return;
            }

            const data = await response.json();
            setRequiredTools(data.required_tools || []);

            // Check mechanic's default warehouse stock
            if (selectedMechanic.default_warehouse_id && data.required_tools.length > 0) {
                const toolIds = data.required_tools.map(t => t.asset_id);
                const stockResponse = await fetch(`${API_URL}/warehouses/check-stock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        warehouse_id: selectedMechanic.default_warehouse_id,
                        tool_ids: toolIds
                    })
                });

                if (stockResponse.ok) {
                    const stockData = await stockResponse.json();
                    const statuses = {};
                    data.required_tools.forEach(tool => {
                        const stock = stockData.find(s => s.asset_id === tool.asset_id);
                        const available = stock ? stock.available_quantity : 0;
                        statuses[tool.asset_id] = {
                            status: available >= tool.total_quantity ? 'surtido' : 'faltante',
                            available: available,
                            needed: tool.total_quantity
                        };
                    });
                    setToolStatuses(statuses);
                }
            } else {
                // No default warehouse, all tools are pending
                const statuses = {};
                data.required_tools.forEach(tool => {
                    statuses[tool.asset_id] = {
                        status: 'faltante',
                        available: 0,
                        needed: tool.total_quantity
                    };
                });
                setToolStatuses(statuses);
            }

            setSurtirStep(2);
        } catch (error) {
            console.error('Error fetching work order:', error);
            alert('Error al buscar la orden de trabajo');
        }
    };

    const handleFulfillTool = async (tool, warehouseId) => {
        try {
            const response = await fetch(`${API_URL}/warehouses/fulfill-tool`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedMechanic.id,
                    asset_id: tool.asset_id,
                    quantity: tool.total_quantity,
                    source_warehouse_id: warehouseId
                })
            });

            if (response.ok) {
                // Update status
                setToolStatuses(prev => ({
                    ...prev,
                    [tool.asset_id]: {
                        ...prev[tool.asset_id],
                        status: 'surtido'
                    }
                }));
                setSelectingWarehouseFor(null);
                alert('Herramienta surtida exitosamente');
            } else {
                alert('Error al surtir herramienta');
            }
        } catch (error) {
            console.error('Error fulfilling tool:', error);
            alert('Error al surtir herramienta');
        }
    };

    const filteredItems = warehouses.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    // Get warehouses excluding mechanic's default AND only general warehouses (not personal)
    const getAvailableWarehouses = () => {
        if (!selectedMechanic) return warehouses.filter(w => !w.is_personal);
        return warehouses.filter(w =>
            w.id !== selectedMechanic.default_warehouse_id && !w.is_personal
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Almacenes</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenSurtirModal}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2"
                    >
                        <ClipboardCheck size={18} />
                        <span>Surtir Orden de trabajo</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Nuevo Almacén</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar almacén..."
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
                            <th className="p-4 font-semibold">Almacén</th>
                            <th className="p-4 font-semibold">Ubicación (Área)</th>
                            <th className="p-4 font-semibold text-center w-40">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-[var(--text-muted)]">Cargando...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-[var(--text-muted)]">No hay registros</td></tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-[var(--text-muted)] font-mono text-xs">{item.id}</td>
                                    <td className="p-4 font-medium text-[var(--text-main)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Warehouse size={16} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>{item.name}</span>
                                                {item.is_personal && (
                                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                                                        Personal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            {item.area_name || 'Sin asignar'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => alert('Próximamente: Items por almacén')}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                                            title="Items por almacén"
                                        >
                                            <PackageSearch size={18} />
                                        </button>
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

            {/* Warehouse Modal */}
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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Ubicación (Área)</label>
                                <select
                                    name="area_id"
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.area_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar Área</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_personal"
                                        checked={formData.is_personal}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 rounded border-[var(--border-glass)] bg-[var(--bg-main)] text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-[var(--text-muted)]">Almacén Personal</span>
                                </label>
                                <p className="text-xs text-[var(--text-muted)] mt-1 ml-6">
                                    Marca esta opción si es un almacén asignado a un mecánico específico
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-glass)]">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-white/5 transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"><Save size={16} /> Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Surtir Orden Modal */}
            {isSurtirModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ClipboardCheck size={24} />
                                Surtir Orden de Trabajo
                            </h3>
                            <button onClick={handleCloseSurtirModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {surtirStep === 1 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Mecánico</label>
                                    <select
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white"
                                        value={selectedMechanic?.id || ''}
                                        onChange={(e) => setSelectedMechanic(mechanics.find(m => m.id === e.target.value))}
                                    >
                                        <option value="">Seleccionar Mecánico...</option>
                                        {mechanics.map(m => (
                                            <option key={m.id} value={m.id}>{m.full_name} - {m.department_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">ID de Orden de Trabajo</label>
                                    <input
                                        type="text"
                                        placeholder="Ingresa o escanea el ID..."
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white"
                                        value={workOrderId}
                                        onChange={(e) => setWorkOrderId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchWorkOrder()}
                                    />
                                </div>
                                <button
                                    onClick={handleSearchWorkOrder}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                                >
                                    Buscar Orden
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-lg border border-[var(--border-glass)]">
                                    <p className="text-sm text-[var(--text-muted)]">Mecánico: <span className="text-white font-medium">{selectedMechanic?.full_name}</span></p>
                                    <p className="text-sm text-[var(--text-muted)]">Orden: <span className="text-white font-medium">#{workOrderId}</span></p>
                                </div>

                                <div className="border border-[var(--border-glass)] rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-white/10">
                                            <tr className="text-left text-[var(--text-muted)] text-sm">
                                                <th className="p-3">Herramienta</th>
                                                <th className="p-3 text-center">Cantidad</th>
                                                <th className="p-3 text-center">Estado</th>
                                                <th className="p-3 text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-glass)]">
                                            {requiredTools.map(tool => {
                                                const status = toolStatuses[tool.asset_id];
                                                return (
                                                    <tr key={tool.asset_id} className="hover:bg-white/5">
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                <Wrench size={16} className="text-orange-400" />
                                                                <div>
                                                                    <div className="text-white font-medium">{tool.tool_name}</div>
                                                                    <div className="text-xs text-[var(--text-muted)]">{tool.model}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center text-white">{tool.total_quantity}</td>
                                                        <td className="p-3 text-center">
                                                            {status?.status === 'surtido' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                                                                    <CheckCircle size={14} /> Surtido
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">
                                                                    <AlertCircle size={14} /> Faltante
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {status?.status === 'faltante' && (
                                                                <button
                                                                    onClick={() => setSelectingWarehouseFor(tool)}
                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                                                >
                                                                    Surtir
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={handleCloseSurtirModal}
                                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Warehouse Selection Modal */}
            {selectingWarehouseFor && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-[var(--border-glass)] pb-3">
                            <h4 className="text-lg font-bold text-white">Seleccionar Almacén</h4>
                            <button onClick={() => setSelectingWarehouseFor(null)} className="text-[var(--text-muted)] hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Selecciona el almacén para surtir: <span className="text-white font-medium">{selectingWarehouseFor.tool_name}</span>
                        </p>
                        <div className="space-y-2">
                            {getAvailableWarehouses().map(wh => (
                                <button
                                    key={wh.id}
                                    onClick={() => handleFulfillTool(selectingWarehouseFor, wh.id)}
                                    className="w-full p-3 bg-white/5 hover:bg-white/10 border border-[var(--border-glass)] rounded-lg text-left text-white transition-colors flex items-center gap-2"
                                >
                                    <Warehouse size={16} className="text-emerald-400" />
                                    {wh.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
