import React from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, Wrench, FileText, Settings, Menu, Bell, User, FolderOpen, Shield, Users } from 'lucide-react';
import logo from '../img/fixio.png';
import { useStore } from '../hooks/useStore';

export default function Layout({ children }) {
    const [location, setLocation] = useLocation();
    const { role, setRole } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        ...(role === 'ADMIN' ? [{ label: 'Bitácoras', path: '/bitacoras', icon: FileText }] : []),
        { label: 'Catálogos', path: '/catalogs', icon: FolderOpen },
        ...(role !== 'ADMIN' ? [{ label: 'Ordenes', path: '/interventions', icon: FileText }] : []),
    ];

    const [showNotifications, setShowNotifications] = React.useState(false);

    const notifications = [
        { id: 1, text: "Stock bajo: Aceite Motor 15W40", time: "Hace 5 min" },
        { id: 2, text: "Nueva orden #5003 asignada", time: "Hace 15 min" },
        { id: 3, text: "Mantenimiento preventivo: Extrusora", time: "Hace 1 hora" },
        { id: 4, text: "Solicitud de herramienta aprobada", time: "Hace 2 horas" },
        { id: 5, text: "Reporte mensual generado", time: "Hace 1 día" },
        { id: 6, text: "Actualización del sistema disponible", time: "Hace 2 días" }
    ];

    const toggleRole = () => {
        setRole(r => r === 'ADMIN' ? 'OPERATOR' : 'ADMIN');
    };

    return (
        <div className="layout-grid relative">
            {/* Floating Role Switcher - Demo Only */}
            <button
                onClick={toggleRole}
                className="fixed bottom-6 left-6 z-[60] flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-full shadow-2xl border border-white/10 hover:bg-[#334155] transition-all group"
                title="Cambiar rol (Demo)"
            >
                {role === 'ADMIN' ? <Shield size={16} className="text-purple-400 group-hover:scale-110 transition-transform" /> : <Users size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />}
                <span className="text-xs font-bold uppercase tracking-wider">{role} MODE</span>
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50 w-[280px] md:w-auto
                    glass-panel md:glass-panel-none m-0 md:m-4 
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    md:bg-transparent md:border-none md:shadow-none
                `}
                style={{ height: 'calc(100vh - 2rem)' }}
            >
                <div className="p-6 border-b border-[var(--border-glass)] relative">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-4 right-4 md:hidden text-[var(--text-muted)] hover:text-white"
                    >
                        ✕
                    </button>

                    <img
                        src={logo}
                        alt="App Logo"
                        className="w-full h-auto mb-4 rounded-lg shadow-lg opacity-90"
                    />
                    <h1 className="text-2xl font-bold text-gradient">Oleander Fixio</h1>
                    <p className="text-sm text-[var(--text-muted)]">Winpak Maintenance System</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.path;
                        return (
                            <div
                                key={item.path}
                                role="link"
                                tabIndex={0}
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setLocation(item.path);
                                }}
                                className={`group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 w-full mb-2 cursor-pointer ${isActive
                                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-lg shadow-blue-500/20 translate-x-1'
                                    : 'bg-[var(--bg-panel)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white hover:translate-x-1 border border-transparent hover:border-[var(--border-glass)]'
                                    }`}>
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-black/20 group-hover:bg-black/40'}`}>
                                    <Icon size={22} className={isActive ? 'text-white' : ''} />
                                </div>
                                <span className="font-bold text-lg tracking-wide">{item.label}</span>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[var(--border-glass)]">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] text-sm">
                        <Settings size={18} />
                        <span>Configuración</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="p-4 h-screen overflow-y-auto w-full">
                {/* Header */}
                <header className="glass-panel mb-6 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {/* Mobile App Name */}
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent md:hidden">
                            Oleander Fixio
                        </h2>

                        {/* Desktop Page Title */}
                        <h2 className="text-xl font-semibold text-[var(--text-main)] hidden md:block">
                            {navItems.find(i => i.path === location)?.label || 'Panel'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                className="btn-icon relative"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--danger)] rounded-full"></span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-[var(--border-glass)] bg-black/20">
                                        <h3 className="font-semibold text-sm">Notificaciones</h3>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.map(n => (
                                            <div key={n.id} className="p-3 border-b border-[var(--border-glass)] hover:bg-white/5 transition-colors cursor-pointer text-left">
                                                <p className="text-sm text-[var(--text-main)] mb-1">{n.text}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{n.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 text-center border-t border-[var(--border-glass)]">
                                        <button className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)]">Marcar todas como leídas</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-glass)] hidden sm:flex">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{role === 'ADMIN' ? 'Fermin Montoya' : 'Operador Demo'}</p>
                                <p className="text-xs text-[var(--text-muted)]">{role === 'ADMIN' ? 'Supervisor' : 'Técnico Nivel 1'}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden transition-colors ${role === 'ADMIN' ? 'bg-[var(--bg-panel)] border-[var(--border-glass)]' : 'bg-blue-500/20 border-blue-500/30'}`}>
                                <User size={20} className={role === 'OPERATOR' ? 'text-blue-400' : ''} />
                            </div>
                        </div>

                        {/* Mobile Hamburger - MOVED TO RIGHT */}
                        <button
                            className="md:hidden btn-icon text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="fade-in pb-20 md:pb-0">
                    {children}
                </div>
            </main>
        </div >
    );
}
