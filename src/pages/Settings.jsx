import React, { useState, useEffect } from 'react';
import { User, Moon, Sun, Globe, Database, Upload, Save, CheckCircle, AlertTriangle, Lock, Bell, Info, Shield, Server, Activity } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const API_URL = 'http://localhost:3001/api';

export default function Settings() {
    const { currentUserId, role, settings, updateSettings, currentUser, refreshUser } = useStore();
    const [activeTab, setActiveTab] = useState('profile');
    const user = currentUser;
    const [loading, setLoading] = useState(false);

    const darkMode = settings.theme === 'dark';
    const language = settings.language;

    // Data Import State
    const [importType, setImportType] = useState('departments');
    const [importFile, setImportFile] = useState(null);
    const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: '', details: [] }
    const [isImporting, setIsImporting] = useState(false);

    // Fetch User Data
    // Fetch User Data is now handled globally in useStore



    // Handle Profile Photo Upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/${currentUserId}/photo`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                await res.json();
                refreshUser();
            } else {
                alert('Error al subir imagen');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Handle Bulk Import
    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        setIsImporting(true);
        setImportStatus(null);

        try {
            const url = `${API_URL}/upload-catalog/${importType}`;
            console.log("INTENTANDO FETCH A:", url); // DEBUG IMPORTANTE

            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            console.log("SERVER RESPONSE DATA:", data); // DEBUG

            if (res.ok) {
                setImportStatus({
                    type: 'success',
                    message: data.message || "Mensaje vacío del servidor", // Fallback
                    details: data.errors
                });
                setImportFile(null);
                // Reset file input
                e.target.reset();
            } else {
                setImportStatus({
                    type: 'error',
                    message: data.error || 'Error desconocido'
                });
            }
        } catch (error) {
            setImportStatus({
                type: 'error',
                message: error.message
            });
        } finally {
            setIsImporting(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'appearance', label: 'Apariencia', icon: darkMode ? Moon : Sun },
        { id: 'language', label: 'Idioma', icon: Globe },
        { id: 'security', label: 'Seguridad', icon: Lock },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'system', label: 'Info del Sistema', icon: Info },
        ...(role === 'ADMIN' ? [{ id: 'data', label: 'Gestión de Datos', icon: Database }] : [])
    ];

    // Security State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [securityMsg, setSecurityMsg] = useState(null);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSecurityMsg(null);
        if (passwords.new !== passwords.confirm) {
            setSecurityMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        if (passwords.new.length < 6) {
            setSecurityMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/${currentUserId}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: passwords.new })
            });
            if (res.ok) {
                setSecurityMsg({ type: 'success', text: 'Contraseña actualizada correctamente' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setSecurityMsg({ type: 'error', text: 'Error al actualizar contraseña' });
            }
        } catch (error) {
            setSecurityMsg({ type: 'error', text: 'Error de conexión' });
        }
    };

    // System Info State
    const [systemInfo, setSystemInfo] = useState(null);
    useEffect(() => {
        if (activeTab === 'system') {
            fetch(`${API_URL}/system-info`)
                .then(res => res.json())
                .then(setSystemInfo)
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    // Notifications State helper
    const togglePreference = (key) => {
        const currentPrefs = settings.preferences || {};
        updateSettings({
            preferences: { ...currentPrefs, [key]: !currentPrefs[key] }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gradient">CONFIGURACIONES V2</h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-[var(--bg-panel)] text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-glass)] p-6 min-h-[500px]">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && user && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <User className="text-blue-400" /> Perfil de Usuario
                            </h3>

                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--bg-app)] shadow-xl bg-slate-800 flex items-center justify-center">
                                        {user.photo_url ? (
                                            <img
                                                src={`${API_URL}${user.photo_url}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={64} className="text-slate-600" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                                        <Upload size={16} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-[var(--text-main)]">{user.full_name}</h4>
                                    <p className="text-[var(--text-muted)]">{user.email}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                            {user.role_name || role}
                                        </span>
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                                            {user.department_name || 'Sin Depto'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[var(--border-glass)]">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Turno</label>
                                        <div className="p-3 bg-[var(--bg-app)] rounded-lg text-[var(--text-main)] border border-[var(--border-glass)]">
                                            {user.shift_name || 'No asignado'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Almacén Default</label>
                                        <div className="p-3 bg-[var(--bg-app)] rounded-lg text-[var(--text-main)] border border-[var(--border-glass)]">
                                            {user.default_warehouse_name || 'Ninguno'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE TAB */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                {darkMode ? <Moon className="text-purple-400" /> : <Sun className="text-yellow-400" />} Apariencia
                            </h3>

                            <div className="bg-[var(--bg-app)] p-6 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-[var(--text-main)]">Tema de la Aplicación</h4>
                                    <p className="text-sm text-[var(--text-muted)]">Cambia entre modo oscuro y claro según tu preferencia.</p>
                                </div>
                                <button
                                    onClick={() => updateSettings({ theme: darkMode ? 'light' : 'dark' })}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-slate-400'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LANGUAGE TAB */}
                    {activeTab === 'language' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Globe className="text-green-400" /> Idioma / Language
                            </h3>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => updateSettings({ language: 'es' })}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${language === 'es'
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-[var(--bg-app)] border-[var(--border-glass)] text-[var(--text-muted)] hover:border-white/20'
                                        }`}
                                >
                                    <span className="font-bold">Español (México)</span>
                                    {language === 'es' && <CheckCircle size={20} />}
                                </button>

                                <button
                                    onClick={() => updateSettings({ language: 'en' })}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${language === 'en'
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-[var(--bg-app)] border-[var(--border-glass)] text-[var(--text-muted)] hover:border-white/20'
                                        }`}
                                >
                                    <span className="font-bold">English (US)</span>
                                    {language === 'en' && <CheckCircle size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-4">
                                * Nota: Actualmente la traducción completa está en desarrollo. Algunos textos podrían permanecer en español.
                            </p>
                        </div>
                    )}

                    {/* DATA MANAGEMENT TAB */}
                    {activeTab === 'data' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Database className="text-orange-400" /> Carga Masiva de Datos
                            </h3>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3 text-yellow-500 mb-6">
                                <AlertTriangle className="shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Precaución</p>
                                    <p>Esta herramienta permite importar grandes cantidades de datos. Asegúrate de usar el formato CSV correcto.</p>
                                </div>
                            </div>

                            <form onSubmit={handleImportSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Tipo de Catálogo</label>
                                    <select
                                        value={importType}
                                        onChange={(e) => setImportType(e.target.value)}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border-glass)] rounded-lg p-3 text-[var(--text-main)] outline-none focus:border-blue-500"
                                    >
                                        <option value="departments">1. Departamentos (departments)</option>
                                        <option value="roles">2. Roles (roles)</option>
                                        <option value="areas">3. Áreas (areas)</option>
                                        <option value="warehouses">4. Almacenes (warehouses)</option>
                                        <option value="asset-categories">5. Categorías de Activos (asset-categories)</option>
                                        <option value="assets">6. Equipos / Activos (assets)</option>
                                        <option value="inventory-categories">7. Categorías de Inventario (inventory-categories)</option>
                                        <option value="inventory-items">8. Items de Inventario (inventory-items)</option>
                                        <option value="users">9. Usuarios (users)</option>
                                        <option value="maintenance-tasks">10. Tareas de Mantenimiento (maintenance-tasks)</option>
                                        <option value="shifts">11. Turnos (shifts)</option>

                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Archivo CSV</label>
                                    <div className="relative border-2 border-dashed border-[var(--border-glass)] rounded-xl p-8 text-center hover:bg-white/5 transition-colors">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => setImportFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="pointer-events-none">
                                            {importFile ? (
                                                <div className="flex flex-col items-center gap-2 text-green-400">
                                                    <FileSpreadsheet size={32} />
                                                    <span className="font-medium">{importFile.name}</span>
                                                    <span className="text-xs text-[var(--text-muted)]">{(importFile.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                                                    <Upload size={32} />
                                                    <span className="font-medium">Arrastra un archivo o haz clic</span>
                                                    <span className="text-xs">Formato: CSV (Valores separados por comas)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!importFile || isImporting}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                                >
                                    {isImporting ? (
                                        <>Procesando...</>
                                    ) : (
                                        <><Upload size={18} /> Importar Datos</>
                                    )}
                                </button>
                            </form>

                            {importStatus && (
                                <div className={`p-4 rounded-lg border ${importStatus.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}>
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        {importStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                        {importStatus.type === 'success' ? 'Importación Exitosa' : 'Error'}
                                    </div>
                                    <p className="text-sm opacity-90">{importStatus.message}</p>
                                    <pre className="text-xs bg-black/20 p-2 mt-2 rounded overflow-auto max-h-40">
                                        DEBUG RAW: {JSON.stringify(importStatus, null, 2)}
                                    </pre>

                                    {importStatus.details && importStatus.details.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                                            <p className="font-semibold mb-1">Detalles:</p>
                                            <ul className="list-disc pl-4 space-y-1 max-h-32 overflow-y-auto">
                                                {importStatus.details.map((err, idx) => (
                                                    <li key={idx}>
                                                        Fila {JSON.stringify(err.record)}: {err.error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Lock className="text-red-400" /> Seguridad
                            </h3>

                            <form onSubmit={handlePasswordChange} className="space-y-4 bg-[var(--bg-app)] p-6 rounded-xl border border-[var(--border-glass)]">
                                <h4 className="font-bold text-[var(--text-main)] mb-4">Cambiar Contraseña</h4>

                                <div>
                                    <label className="block text-sm text-[var(--text-muted)] mb-1">Contraseña Actual (Demo: Cualquiera)</label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-muted)] mb-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-muted)] mb-1">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {securityMsg && (
                                    <div className={`p-3 rounded text-sm ${securityMsg.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {securityMsg.text}
                                    </div>
                                )}

                                <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                                    <Save size={18} /> Actualizar Contraseña
                                </button>
                            </form>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Bell className="text-yellow-400" /> Preferencias de Notificaciones
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Bell size={20} /></div>
                                        <div>
                                            <p className="font-bold text-[var(--text-main)]">Alertas Generales</p>
                                            <p className="text-xs text-[var(--text-muted)]">Activar notificaciones globales</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications_enabled}
                                            onChange={() => updateSettings({ notifications_enabled: !settings.notifications_enabled })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Shield size={20} /></div>
                                        <div>
                                            <p className="font-bold text-[var(--text-main)]">Alertas de Stock Bajo</p>
                                            <p className="text-xs text-[var(--text-muted)]">Notificar cuando el inventario sea crítico</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.preferences?.low_stock !== false}
                                            onChange={() => togglePreference('low_stock')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Activity size={20} /></div>
                                        <div>
                                            <p className="font-bold text-[var(--text-main)]">Mantenimientos Programados</p>
                                            <p className="text-xs text-[var(--text-muted)]">Recordatorios de mantenimientos próximos</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.preferences?.maintenance_reminders !== false}
                                            onChange={() => togglePreference('maintenance_reminders')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SYSTEM INFO TAB */}
                    {activeTab === 'system' && (
                        <div className="space-y-8 max-w-xl">
                            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Info className="text-cyan-400" /> Información del Sistema
                            </h3>

                            {systemInfo ? (
                                <div className="grid gap-4">
                                    <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Server size={20} /></div>
                                            <div>
                                                <p className="font-bold text-[var(--text-main)]">Versión del Sistema</p>
                                                <p className="text-xs text-[var(--text-muted)]">Build 2026.02.10</p>
                                            </div>
                                        </div>
                                        <span className="font-mono bg-white/10 px-2 py-1 rounded text-sm">{systemInfo.version}</span>
                                    </div>

                                    <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Database size={20} /></div>
                                            <div>
                                                <p className="font-bold text-[var(--text-main)]">Estado de Base de Datos</p>
                                                <p className="text-xs text-[var(--text-muted)]">{systemInfo.dbVersion}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${systemInfo.dbStatus === 'Connected' ? 'text-green-400 bg-green-500/10' : 'text-red-400'}`}>
                                            {systemInfo.dbStatus}
                                        </span>
                                    </div>

                                    <div className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Activity size={20} /></div>
                                            <div>
                                                <p className="font-bold text-[var(--text-main)]">Tiempo de Actividad</p>
                                                <p className="text-xs text-[var(--text-muted)]">Uptime del servidor</p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-sm">
                                            {Math.floor(systemInfo.uptime / 3600)}h {Math.floor((systemInfo.uptime % 3600) / 60)}m
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-[var(--text-muted)]">Cargando información...</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function FileSpreadsheet({ size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13h2" />
            <path d="M8 17h2" />
            <path d="M14 13h2" />
            <path d="M14 17h2" />
        </svg>
    );
}
