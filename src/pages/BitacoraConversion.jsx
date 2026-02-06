import React, { useState } from 'react';
import { Link } from 'wouter';
import {
    Search, ArrowLeft, Plus, X, Save, Trash2,
    FileText, Calendar, Clock, PenTool, AlertTriangle, FileDown, Table
} from 'lucide-react';

const MOCK_DATA = [
    {
        id: 1,
        item: '330',
        fechaCreacion: '2026-02-06',
        fechaTermino: '2026-02-06',
        status: 'CERRADA',
        area: 'CONVERSION',
        maquina: 'CH-10',
        seccion: 'RODILLOS',
        horaInicio: '10:29',
        horaFin: '11:15',
        minIntervencion: '46',
        minTotalParo: '46',
        realizo: 'JUAN PEREZ',
        tipoFalla: 'MECANICA',
        tipoAccion: 'CORRECTIVA',
        cantidad: '1',
        refaccion: 'RODILLO DE ARRASTRE',
        falla: 'DESGASTE PREMATURO',
        solucion: 'CAMBIO DE RODILLO',
        analisisFalla: 'FATIGA DE MATERIAL',
        opl: 'NO APLICA',
        comentarios: 'SE RECOMIENDA REVISAR ALINEACION'
    },
    {
        id: 2,
        item: '331',
        fechaCreacion: '2026-02-05',
        fechaTermino: '2026-02-05',
        status: 'ABIERTA',
        area: 'EXTRUSION',
        maquina: 'EXT-02',
        seccion: 'TOLVA',
        horaInicio: '08:00',
        horaFin: '',
        minIntervencion: '0',
        minTotalParo: '120',
        realizo: 'CARLOS LOPEZ',
        tipoFalla: 'ELECTRICA',
        tipoAccion: 'PREVENTIVA',
        cantidad: '0',
        refaccion: 'N/A',
        falla: 'SENSOR DAÑADO',
        solucion: 'EN PROCESO',
        analisisFalla: 'SOBRECALENTAMIENTO',
        opl: 'OPL-2026-05',
        comentarios: 'ESPERANDO REFACCION'
    }
];

export default function BitacoraConversion() {
    const [items, setItems] = useState(MOCK_DATA);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                item: '', fechaCreacion: '', fechaTermino: '', status: 'ABIERTA',
                area: '', maquina: '', seccion: '',
                horaInicio: '', horaFinalizacion: '', minIntervencion: '', minTotalParo: '',
                realizo: '', tipoFalla: '', tipoAccion: '',
                cantidad: '', refaccion: '', falla: '', solucion: '',
                analisisFalla: '', opl: '', comentarios: ''
            });
        }
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(i =>
        i.item.includes(search) ||
        i.maquina.toLowerCase().includes(search.toLowerCase()) ||
        i.falla.toLowerCase().includes(search.toLowerCase())
    );

    const InputField = ({ label, name, type = "text" }) => (
        <div className="mb-2">
            <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
        </div>
    );

    const SelectField = ({ label, name, options }) => (
        <div className="mb-2">
            <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">{label}</label>
            <select
                name={name}
                value={formData[name] || ''}
                onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none"
            >
                <option value="">Seleccione...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

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
                                    <td className="p-4 text-slate-300">{item.fechaCreacion}</td>
                                    <td className="p-4 font-medium text-white">{item.maquina}</td>
                                    <td className="p-4 text-slate-300 max-w-xs truncate" title={item.falla}>{item.falla}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'CERRADA' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
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
                                <InputField label="Item" name="item" />
                                <InputField label="Fecha Creacion" name="fechaCreacion" type="date" />
                                <InputField label="Fecha Termino" name="fechaTermino" type="date" />
                                <SelectField label="Status" name="status" options={['ABIERTA', 'CERRADA', 'PENDIENTE']} />
                                <SelectField label="Area" name="area" options={['CONVERSION', 'EXTRUSION', 'IMPRESION']} />
                                <SelectField label="Maquina" name="maquina" options={['CH-10', 'CH-11', 'CH-12', 'EXT-01', 'EXT-02']} />
                                <SelectField label="Seccion" name="seccion" options={['RODILLOS', 'BOBINADOR', 'PANEL', 'DESBOBINADOR']} />
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <InputField label="Hora Inicio" name="horaInicio" type="time" />
                                    <InputField label="Hora Fin" name="horaFinalizacion" type="time" />
                                </div>
                                <InputField label="Min Intervencion" name="minIntervencion" type="number" />
                                <InputField label="Min Total Paro" name="minTotalParo" type="number" />
                                <SelectField label="Realizo" name="realizo" options={['JUAN PEREZ', 'CARLOS LOPEZ', 'ANA MARTINEZ']} />
                                <SelectField label="Tipo De Falla" name="tipoFalla" options={['MECANICA', 'ELECTRICA', 'NEUMATICA', 'OPERATIVA']} />
                                <SelectField label="Tipo De Accion" name="tipoAccion" options={['CORRECTIVA', 'PREVENTIVA', 'MEJORA']} />
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-4">
                                <InputField label="Cantidad" name="cantidad" type="number" />
                                <SelectField label="Refaccion" name="refaccion" options={['RODILLO', 'SENSOR', 'MOTOR', 'N/A']} />
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Falla</label>
                                    <textarea name="falla" rows="2" className="w-full bg-slate-800 border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none" />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Solucion</label>
                                    <textarea name="solucion" rows="2" className="w-full bg-slate-800 border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none" />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-xs font-bold text-cyan-300 mb-1 uppercase tracking-wide">Analisis de Falla</label>
                                    <input type="text" name="analisisFalla" className="w-full bg-slate-800 border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-400 outline-none" />
                                </div>
                                <InputField label="OPL" name="opl" />
                                <InputField label="Comentarios" name="comentarios" />
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
                                onClick={() => setIsModalOpen(false)}
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
