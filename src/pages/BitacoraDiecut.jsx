import React, { useState } from 'react';
import { Link } from 'wouter';
import {
    Search, ArrowLeft, Plus, X, Save, Trash2,
    ClipboardList, PenTool, History, FileDown, Table
} from 'lucide-react';

const MOCK_DATA = [
    {
        id: 1,
        wdc: 'WDC-01',
        fecha: '2026-02-06',
        horaInicio: '10:29:39 AM',
        diametro: '75mm',
        troquel: 'TR-55',
        embosser: 'EMB-01',
        tipoFalla: 'DESALINEACION',
        causa: 'VIBRACION EXCESIVA',
        tiempoIntervencion: '30',
        tiempoParo: '45',
        comentarios: 'Se ajustaron los pernos de sujeción.',
        ajustador: 'PEDRO S.',
        operador: 'MIGUEL A.'
    },
    {
        id: 2,
        wdc: 'WDC-02',
        fecha: '2026-02-05',
        horaInicio: '08:15:00 AM',
        diametro: '90mm',
        troquel: 'TR-12',
        embosser: 'EMB-02',
        tipoFalla: 'ATASCO',
        causa: 'MATERIAL DEFECTUOSO',
        tiempoIntervencion: '15',
        tiempoParo: '20',
        comentarios: 'Limpieza de residuos en la cavidad.',
        ajustador: 'JUAN R.',
        operador: 'LUIS M.'
    }
];

export default function BitacoraDiecut() {
    const [items, setItems] = useState(MOCK_DATA);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                wdc: '', fecha: new Date().toISOString().split('T')[0], horaInicio: '',
                diametro: '', troquel: '', embosser: '',
                tipoFalla: '', causa: '',
                tiempoIntervencion: '', tiempoParo: '',
                comentarios: '', ajustador: '', operador: ''
            });
        }
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(i =>
        i.wdc.toLowerCase().includes(search.toLowerCase()) ||
        i.troquel.toLowerCase().includes(search.toLowerCase()) ||
        i.tipoFalla.toLowerCase().includes(search.toLowerCase())
    );

    const InputField = ({ label, name, type = "text" }) => (
        <div className="mb-3">
            <label className="block text-white font-medium mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
    );

    const SelectField = ({ label, name, options }) => (
        <div className="mb-3">
            <label className="block text-white font-medium mb-1">{label}</label>
            <select
                name={name}
                value={formData[name] || ''}
                onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Bitácora Diecut
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">Control de troqueles y ajustes</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar WDC, Troquel, Falla..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-purple-500 outline-none"
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
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
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
                                <th className="p-4 font-bold border-b border-slate-700">WDC</th>
                                <th className="p-4 font-bold border-b border-slate-700">Fecha</th>
                                <th className="p-4 font-bold border-b border-slate-700">Troquel</th>
                                <th className="p-4 font-bold border-b border-slate-700">Falla</th>
                                <th className="p-4 font-bold border-b border-slate-700">T. Paro (Min)</th>
                                <th className="p-4 font-bold border-b border-slate-700 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-mono text-purple-300 font-bold">{item.wdc}</td>
                                    <td className="p-4 text-slate-300">{item.fecha}</td>
                                    <td className="p-4 font-medium text-white">{item.troquel}</td>
                                    <td className="p-4 text-slate-300">{item.tipoFalla}</td>
                                    <td className="p-4 text-slate-300">{item.tiempoParo}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-purple-400 transition-colors"
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
                    <div className="bg-[#1f2937] border border-slate-600 w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">

                        {/* Modal Header */}
                        <div className="bg-[#111827] p-4 text-center border-b border-slate-600">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                                BITACORA DIECUT
                            </h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <SelectField label="WDC" name="wdc" options={['WDC-01', 'WDC-02', 'WDC-03']} />
                            <InputField label="Fecha" name="fecha" type="date" />
                            <InputField label="Hora de inicio de intervención" name="horaInicio" type="time" />
                            <SelectField label="Diámetro de cavidad" name="diametro" options={['75mm', '90mm', '110mm']} />
                            <SelectField label="Número de troquel" name="troquel" options={['TR-55', 'TR-12', 'TR-88']} />
                            <SelectField label="Embosser" name="embosser" options={['EMB-01', 'EMB-02']} />
                            <SelectField label="Tipo de falla" name="tipoFalla" options={['DESALINEACION', 'ATASCO', 'CORTE INCOMPLETO']} />
                            <SelectField label="Probables causas" name="causa" options={['VIBRACION', 'MATERIAL', 'DESGASTE']} />
                            <InputField label="Tiempo de intervención (Minutos)" name="tiempoIntervencion" type="number" />
                            <InputField label="Tiempo total de paro (Minutos)" name="tiempoParo" type="number" />

                            <div className="mb-3">
                                <label className="block text-white font-medium mb-1">Comentarios</label>
                                <textarea
                                    name="comentarios"
                                    rows="3"
                                    className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.comentarios || ''}
                                    onChange={e => setFormData({ ...formData, comentarios: e.target.value })}
                                />
                            </div>

                            <SelectField label="Ajustador" name="ajustador" options={['PEDRO S.', 'JUAN R.']} />
                            <SelectField label="Operador" name="operador" options={['MIGUEL A.', 'LUIS M.']} />
                        </div>

                        {/* Modal Footer (Buttons matching image) */}
                        <div className="p-4 bg-[#111827] border-t border-slate-600 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow transition-colors uppercase text-sm flex items-center gap-2">
                                <Save size={18} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
