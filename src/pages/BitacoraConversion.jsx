import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
    Search, ArrowLeft, Plus, X, Save, Trash2,
    FileText, Calendar, Clock, PenTool, AlertTriangle, FileDown, Table
} from 'lucide-react';

const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
        />
    </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none"
        >
            <option value="">Seleccione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function BitacoraConversion() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [userOptions, setUserOptions] = useState([]);
    const [rawUsers, setRawUsers] = useState([]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/conversion-logs');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                fetchLogs();
                const userRes = await fetch('http://localhost:3001/api/users');
                const userData = await userRes.json();
                if (Array.isArray(userData)) {
                    setRawUsers(userData);
                    const names = userData.map(u => u.full_name);
                    setUserOptions([...new Set(names)].sort());
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Time mask logic for HH:MM:SS
        if (name === 'horaInicio' || name === 'horaFinalizacion') {
            const digits = value.replace(/\D/g, '').substring(0, 6);
            let masked = '';
            if (digits.length > 0) masked += digits.substring(0, 2);
            if (digits.length > 2) masked += ':' + digits.substring(2, 4);
            if (digits.length > 4) masked += ':' + digits.substring(4, 6);
            setFormData(prev => ({ ...prev, [name]: masked }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const realizoUser = rawUsers.find(u => u.full_name === formData.realizo);

            // Basic validation for time format if provided
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
            if (formData.horaInicio && !timeRegex.test(formData.horaInicio)) {
                alert('Formato de hora de inicio inválido (HH:MM:SS)');
                return;
            }
            if (formData.horaFinalizacion && !timeRegex.test(formData.horaFinalizacion)) {
                alert('Formato de hora de fin inválido (HH:MM:SS)');
                return;
            }

            const payload = {
                item: formData.item,
                fecha_creacion: formData.fechaCreacion,
                fecha_termino: formData.fechaTermino || null,
                status: formData.status,
                area: formData.area,
                maquina: formData.maquina,
                seccion: formData.seccion,
                hora_inicio: formData.horaInicio || null,
                hora_fin: formData.horaFinalizacion || null,
                min_intervencion: parseInt(formData.minIntervencion) || 0,
                min_total_paro: parseInt(formData.minTotalParo) || 0,
                realizo_id: realizoUser?.id || null,
                tipo_falla: formData.tipoFalla,
                tipo_accion: formData.tipoAccion,
                cantidad: parseInt(formData.cantidad) || 0,
                refaccion: formData.refaccion,
                falla: formData.falla,
                solucion: formData.solucion,
                analisis_falla: formData.analisisFalla,
                opl: formData.opl,
                comentarios: formData.comentarios
            };

            const res = await fetch('http://localhost:3001/api/conversion-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchLogs();
            } else {
                const errorData = await res.json();
                alert('Error al guardar: ' + (errorData.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Error de conexión');
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                ...item,
                fechaCreacion: item.fecha_creacion ? item.fecha_creacion.split('T')[0] : '',
                fechaTermino: item.fecha_termino ? item.fecha_termino.split('T')[0] : '',
                horaInicio: item.hora_inicio || '',
                horaFinalizacion: item.hora_fin || '',
                minIntervencion: item.min_intervencion || '',
                minTotalParo: item.min_total_paro || '',
                tipoFalla: item.tipo_falla || '',
                tipoAccion: item.tipo_accion || '',
                analisisFalla: item.analisis_falla || ''
            });
        } else {
            setFormData({
                item: '', fechaCreacion: new Date().toISOString().split('T')[0], fechaTermino: '',
                status: 'Abierta', area: '', maquina: '', seccion: '',
                horaInicio: '', horaFinalizacion: '', minIntervencion: '', minTotalParo: '',
                realizo: '', tipoFalla: '', tipoAccion: '',
                cantidad: '', refaccion: '', falla: '', solucion: '',
                analisisFalla: '', opl: '', comentarios: ''
            });
        }
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(i =>
        (i.item || '').includes(search) ||
        (i.maquina || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.falla || '').toLowerCase().includes(search.toLowerCase())
    );

    const maquinaOptions = [
        'CI8', 'ML2', 'S1DT', 'Doctor Machine', 'Compactadora', 'Flejadora',
        'Dobladora de placas', 'Cortina Rapida', 'Oficinas', 'WDC-01',
        'WDC-02', 'WDC-03', 'WDC-04', 'WDC-05', 'Sistema de Vacio'
    ].sort();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/bitacoras" className="p-2 rounded-full hover:bg-white/10 text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Bitácora Conversión
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">Gestión de incidencias y registros de operación</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por Item, Máquina o Falla..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Plus size={20} /> <span className="hidden sm:inline">Nuevo</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="glass-panel overflow-hidden border border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-700">Item</th>
                                <th className="p-4 font-bold border-b border-slate-700">Fecha</th>
                                <th className="p-4 font-bold border-b border-slate-700">Máquina</th>
                                <th className="p-4 font-bold border-b border-slate-700">Falla Reportada</th>
                                <th className="p-4 font-bold border-b border-slate-700">Status</th>
                                <th className="p-4 font-bold border-b border-slate-700 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-mono text-cyan-300 font-bold">#{item.item}</td>
                                    <td className="p-4 text-slate-300">{item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : ''}</td>
                                    <td className="p-4 font-medium text-white">{item.maquina}</td>
                                    <td className="p-4 text-slate-300 max-w-xs truncate" title={item.falla}>{item.falla}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Cerrada' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400 transition-colors"
                                        >
                                            <PenTool size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-cyan-900/50 w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#0f4c75] to-[#1b262c] p-4 flex justify-between items-center border-b border-cyan-800 shadow-lg">
                            <h3 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                                <FileText size={24} className="text-cyan-400" />
                                Bitacora Conversion
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Modal Body - 3 Columns Grid */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#16213e]">

                            {/* Column 1 */}
                            <div className="space-y-4">
                                <InputField label="Item" name="item" value={formData.item} onChange={handleInputChange} />
                                <InputField label="Fecha Creacion" name="fechaCreacion" type="date" value={formData.fechaCreacion} onChange={handleInputChange} />
                                <InputField label="Fecha Termino" name="fechaTermino" type="date" value={formData.fechaTermino} onChange={handleInputChange} />
                                <SelectField label="Status" name="status" options={['Cerrada', 'Abierta']} value={formData.status} onChange={handleInputChange} />
                                <SelectField label="Area" name="area" options={['Conversion', 'Almacen', 'Infraestructura', 'Diecut', 'Oficinas', 'Pre-Prensa', 'Calidad', 'Osmosis']} value={formData.area} onChange={handleInputChange} />
                                <SelectField label="Maquina" name="maquina" options={maquinaOptions} value={formData.maquina} onChange={handleInputChange} />
                                <SelectField label="Seccion" name="seccion" options={['RODILLOS', 'BOBINADOR', 'PANEL', 'DESBOBINADOR']} value={formData.seccion} onChange={handleInputChange} />
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <InputField label="Hora Inicio" name="horaInicio" type="text" value={formData.horaInicio} onChange={handleInputChange} placeholder="HH:MM:SS" />
                                    <InputField label="Hora Fin" name="horaFinalizacion" type="text" value={formData.horaFinalizacion} onChange={handleInputChange} placeholder="HH:MM:SS" />
                                </div>
                                <InputField label="Min Intervencion" name="minIntervencion" type="number" value={formData.minIntervencion} onChange={handleInputChange} />
                                <InputField label="Min Total Paro" name="minTotalParo" type="number" value={formData.minTotalParo} onChange={handleInputChange} />
                                <SelectField label="Realizo" name="realizo" options={userOptions} value={formData.realizo} onChange={handleInputChange} />
                                <SelectField label="Tipo De Falla" name="tipoFalla" options={['Alarma', 'Mecanica', 'Mecanica/Control', 'Mecanica/Electrica', 'Electrica', 'Programa', 'Sensor', 'Hidraulica', 'Neumatica', 'Control', 'Mecanica/Neumatica']} value={formData.tipoFalla} onChange={handleInputChange} />
                                <SelectField label="Tipo De Accion" name="tipoAccion" options={['Correctivo', 'Preventivo']} value={formData.tipoAccion} onChange={handleInputChange} />
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-4">
                                <InputField label="Cantidad" name="cantidad" type="number" value={formData.cantidad} onChange={handleInputChange} />
                                <SelectField label="Refaccion" name="refaccion" options={[
                                    'N/A', 'Tornillos de perno 6mm', 'Filtros de aire', 'Tornillo M6 x 70mm', 'Rodillo Lototec',
                                    'Motor de Inkeys usadas', 'Sensor de posicion home', 'Cable coaxial', 'Rodillo porta-mantillas',
                                    'Rodillo portaplacas', 'Cable de conexion paralelo inkey reacondicionado', 'Rodamiento 6502',
                                    'Sensor OMRON E2K-C25MF1', 'Manguera neumatica', 'Tornillos M6 x 110mm', 'Rodillo de formato 8',
                                    'Rodillo cromado 10', 'Rodillo distribuidor 11', 'Rodillo distribuidor 12', 'Rodillo oscilador 13',
                                    'Rodillo de formato 14', 'Rodillo de formato 15', 'Rodillo de apoyo 16', 'Rodillo Suminitrador de tinta 1',
                                    'Rodillo Ductor 2', 'Rodillo oscilador 3', 'Rodillo distribuidor 4', 'Rodillo distribuidor 5',
                                    'Rodillo distribuidor 6', 'Rodillo oscilador 7'
                                ]} value={formData.refaccion} onChange={handleInputChange} />
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Falla</label>
                                    <textarea
                                        name="falla"
                                        rows="2"
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none"
                                        value={formData.falla || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Solucion</label>
                                    <textarea
                                        name="solucion"
                                        rows="2"
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none"
                                        value={formData.solucion || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Analisis de Falla</label>
                                    <input
                                        type="text"
                                        name="analisisFalla"
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none"
                                        value={formData.analisisFalla || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <InputField label="OPL" name="opl" value={formData.opl} onChange={handleInputChange} />
                                <InputField label="Comentarios" name="comentarios" value={formData.comentarios} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[#0f172a] border-t border-cyan-900/50 flex justify-end gap-3 sticky bottom-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
                            >
                                <Save size={18} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
