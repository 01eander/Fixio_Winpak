import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, Briefcase, Mail, Phone, Lock, Edit, Trash2, X, Save, ArrowLeft, Warehouse, Clock } from 'lucide-react';
import { Link } from 'wouter';

const API_URL = 'http://localhost:3001/api';

export default function Mechanics() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role_id: '',
        department_id: '',
        password_hash: '',
        default_warehouse_id: '',
        shift_id: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
        fetchRoles();
        fetchWarehouses();
        fetchShifts();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_URL}/departments`);
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch(`${API_URL}/roles`);
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await fetch(`${API_URL}/warehouses`);
            if (response.ok) {
                const data = await response.json();
                setWarehouses(data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const fetchShifts = async () => {
        try {
            const response = await fetch(`${API_URL}/shifts`);
            if (response.ok) {
                const data = await response.json();
                setShifts(data);
            }
        } catch (error) {
            console.error('Error fetching shifts:', error);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                full_name: user.full_name,
                email: user.email,
                role_id: user.role_id || '',
                department_id: user.department_id || '',
                password_hash: '', // Don't show hash
                default_warehouse_id: user.default_warehouse_id || '',
                shift_id: user.shift_id || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                full_name: '',
                email: '',
                role_id: '',
                department_id: '',
                password_hash: '',
                default_warehouse_id: '',
                shift_id: '',
                default_warehouse_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingUser ? `${API_URL}/users/${editingUser.id}` : `${API_URL}/users`;
            const method = editingUser ? 'PUT' : 'POST';

            const body = {
                ...formData,
                is_active: true // Ensure active on create/update if not specified
            };
            if (!body.password_hash && !editingUser) body.password_hash = 'default123'; // Temporary default

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchUsers(); // Refresh list
                handleCloseModal();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
        try {
            const response = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
            if (response.ok) fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Helper to determine if selected role or department is Maintenance-related
    const selectedRole = roles.find(r => String(r.id) === String(formData.role_id));
    const isMaintenanceRole = selectedRole && ['MANTENIMIENTO', 'MAINTENANCE', 'TÉCNICO', 'TECNICO'].some(n => selectedRole.name.toUpperCase().includes(n));

    const selectedDepartment = departments.find(d => String(d.id) === String(formData.department_id));
    const isMaintenanceDept = selectedDepartment && ['MANTENIMIENTO', 'MAINTENANCE'].some(n => selectedDepartment.name.toUpperCase().includes(n));

    const showWarehouseSelector = isMaintenanceRole || isMaintenanceDept;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/catalogs" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gradient">Mecánicos y Operadores</h2>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-glass)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
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
                            <th className="p-4 font-semibold">Usuario</th>
                            <th className="p-4 font-semibold">Turno</th>
                            <th className="p-4 font-semibold">Rol</th>
                            <th className="p-4 font-semibold">Departamento</th>
                            <th className="p-4 font-semibold">Almacén Default</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">Cargando usuarios...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No se encontraron usuarios</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-[var(--text-main)]">{user.full_name}</div>
                                                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-yellow-500" />
                                            <span className="text-[var(--text-main)]">{user.shift_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-purple-400" />
                                            <span className="text-[var(--text-main)]">{user.role_name || user.role || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} />
                                            <span className="text-[var(--text-main)]">{user.department_name || user.department || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">
                                        {user.default_warehouse_name ? (
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <Warehouse size={14} />
                                                {user.default_warehouse_name}
                                            </div>
                                        ) : (
                                            <span className="text-[var(--text-muted)] text-xs italic">Ninguno</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
                            <h3 className="text-xl font-bold text-white">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Rol</label>
                                    <select
                                        name="role_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.role_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccionar Rol</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Departamento</label>
                                    <select
                                        name="department_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.department_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccionar Depto</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Shifts */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                                    <Clock size={16} /> Turno
                                </label>
                                <select
                                    name="shift_id"
                                    required
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.shift_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar Turno</option>
                                    {shifts.map(shift => (
                                        <option key={shift.id} value={shift.id}>{shift.name} ({parseFloat(shift.daily_hours).toFixed(1)} hrs)</option>
                                    ))}
                                </select>
                            </div>

                            {/* NEW: Default Warehouse Dropdown if Maintenance Role OR Department */}
                            {showWarehouseSelector && (
                                <div className="border-t border-[var(--border-glass)] pt-4 mt-2">
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1 flex items-center gap-2">
                                        <Warehouse size={16} /> Almacén Predeterminado
                                    </label>
                                    <select
                                        name="default_warehouse_id"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.default_warehouse_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Ninguno</option>
                                        {warehouses
                                            .filter(wh => wh.is_personal === true)
                                            .map(wh => (
                                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                                            ))
                                        }
                                    </select>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                        Selecciona el almacén base para este usuario de mantenimiento.
                                    </p>
                                </div>
                            )}

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Contraseña (Default: default123)</label>
                                    <input
                                        type="password"
                                        name="password_hash"
                                        placeholder="Dejar vacio para default"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-all"
                                        value={formData.password_hash}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}

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
