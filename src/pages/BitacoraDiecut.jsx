import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
    Search, ArrowLeft, Plus, X, Save, Trash2,
    ClipboardList, PenTool, History, FileDown, Table
} from 'lucide-react';

const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="mb-3">
        <label className="block text-white font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
    </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="mb-3">
        <label className="block text-white font-medium mb-1">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        >
            <option value="">Seleccione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function BitacoraDiecut() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [wdcOptions, setWdcOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [rawEquipment, setRawEquipment] = useState([]);
    const [rawUsers, setRawUsers] = useState([]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/diecut-logs');
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
                const eqRes = await fetch('http://localhost:3001/api/equipment');
                const eqData = await eqRes.json();
                if (Array.isArray(eqData)) {
                    setRawEquipment(eqData);
                    const filtered = eqData
                        .filter(e => e.name && e.name.toUpperCase().startsWith('WDC'))
                        .map(e => e.name);
                    setWdcOptions([...new Set(filtered)].sort());
                }
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
        if (name === 'horaInicio') {
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
            const equipment = rawEquipment.find(e => e.name === formData.wdc);
            const ajustador = rawUsers.find(u => u.full_name === formData.ajustador);
            const operador = rawUsers.find(u => u.full_name === formData.operador);

            // Basic validation for time format if provided
            if (formData.horaInicio && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(formData.horaInicio)) {
                alert('Formato de hora inválido (HH:MM:SS)');
                return;
            }

            const payload = {
                equipment_id: equipment?.id || null,
                fecha: formData.fecha,
                hora_inicio: formData.horaInicio || null,
                diametro: formData.diametro,
                troquel: formData.troquel,
                embosser: formData.embosser,
                tipo_falla: formData.tipoFalla,
                causa: formData.causa,
                tiempo_intervencion: parseInt(formData.tiempoIntervencion) || 0,
                tiempo_paro: parseInt(formData.tiempoParo) || 0,
                comentarios: formData.comentarios,
                ajustador_id: ajustador?.id || null,
                operador_id: operador?.id || null
            };

            const res = await fetch('http://localhost:3001/api/diecut-logs', {
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
                horaInicio: item.hora_inicio || '',
                tipoFalla: item.tipo_falla || '',
                tiempoIntervencion: item.tiempo_intervencion || '',
                tiempoParo: item.tiempo_paro || '',
                wdc: item.wdc || '',
                ajustador: item.ajustador || '',
                operador: item.operador || '',
                comentarios: item.comentarios || '',
                fecha: item.fecha ? item.fecha.split('T')[0] : '',
                diametro: item.diametro || '',
                troquel: item.troquel || '',
                embosser: item.embosser || '',
                causa: item.causa || ''
            });
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
        (i.wdc || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.troquel || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.tipo_falla || '').toLowerCase().includes(search.toLowerCase())
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
                                    <td className="p-4 text-slate-300">{item.fecha ? new Date(item.fecha).toLocaleDateString() : ''}</td>
                                    <td className="p-4 font-medium text-white">{item.troquel}</td>
                                    <td className="p-4 text-slate-300">{item.tipo_falla}</td>
                                    <td className="p-4 text-slate-300">{item.tiempo_paro}</td>
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
                            <SelectField label="WDC" name="wdc" options={wdcOptions} value={formData.wdc} onChange={handleInputChange} />
                            <InputField label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} />
                            <InputField label="Hora de inicio de intervención" name="horaInicio" type="text" value={formData.horaInicio} onChange={handleInputChange} placeholder="HH:MM:SS" />
                            <SelectField label="Diámetro de cavidad" name="diametro" options={['53mm', '73.5mm', '75.5mm', '79mm', '83mm', '93mm', '95.5mm', '118mm']} value={formData.diametro} onChange={handleInputChange} />
                            <SelectField label="Número de troquel" name="troquel" options={['1', '2', '3', '5', '6', '70', '214', '215', '232', '239', '247', '248', '262C', '339', '820589', '854122', '857684']} value={formData.troquel} onChange={handleInputChange} />
                            <SelectField label="Embosser" name="embosser" options={['1', '1D', '1K', '1N', '1O', '1S', '1U', '2A', '2G', '2X', '3', '3B', '3C', '3D', '3E']} value={formData.embosser} onChange={handleInputChange} />
                            <SelectField label="Tipo de falla" name="tipoFalla" options={[
                                'Ajuste', 'Ajuste de banda transportadora', 'Ajuste de barra de curvatura', 'Ajuste de sensor', 'Ajuste de troquel', 'Arranque', 'Atascamiento', 'Atascamiento de material', 'Atascamiento en rodillos naranjas', 'Atascamientos constantes', 'Atascamientos y pestañas', 'Banda atascada', 'Banda de scrap rota', 'Banda de scrap se para', 'Bloqueo', 'Brillo', 'Cabello de angel', 'Cabello de angel y bloqueo', 'Cabello de angel y recortes', 'Cabello de angel y tapas dobladas', 'Cambio de embosser', 'Cambio de freno magnetico', 'Cambio de gofradora', 'Cambio de iman', 'Cambio de ot', 'Cambio de troquel', 'Cambio de troquel y embosser', 'Curvatura en material', 'Exceso de brillo', 'Exceso de laca', 'Falla Mecanica', 'Filo por arranque', 'Gofrado bajo', 'Laca', 'Mal ajuste de impreso', 'Mancha en gofradora', 'Material se atora', 'Mecanica', 'Mordidas', 'Mordidas en cavidades', 'Mordidas y pestañas', 'No enciende máquina', 'No enciende sistema de vacio', 'No funciona pontenciometro', 'No se lee velocidad en el WEM - Dei Cut', 'Pestañas', 'Pestañas en cavidades', 'Plastico naranja roto', 'Plastico roto naranja', 'Posible bloqueo', 'Recorte', 'Recortes', 'Recortes y brillo', 'Recortes y cabello de angel', 'Recortes y mordidas', 'Regulador de presion dañado', 'Rodillo guia mal posicionado', 'Rodillo naranja dañado', 'Se para máquina', 'Sonido en banda de scrap', 'Tapas dobladas y cabello de angel', 'Tapas dobladas y recortes', 'Tapas dobladas, bloqueo y recortes', 'Telaraña mordida'
                            ]} value={formData.tipoFalla} onChange={handleInputChange} />
                            <SelectField label="Probables causas" name="causa" options={[
                                'Ajuste', 'Ajuste de rodillos naranjas', 'Ajuste de timing', 'Ayudante no seca telaraña', 'Cable desconectado', 'Cables rotos de potenciometro', 'Cambio de orden', 'Cambio de OT', 'Cavidad sucia', 'Cavidades sucias', 'Cinta pegada', 'Desajuste de la barra de curvatura', 'Desajuste de penetracion', 'Desajuste de rodillos naranjas', 'Desajuste del sensor de alimentacion', 'Desajuste del troquel', 'Desgaste en punzones', 'Desgaste Mecanico', 'Embosser dañado', 'Embosser mal fijado', 'Error en comunicación del sensor', 'Exceso de brillo', 'Exceso de penetración', 'Exceso de presión en rodillo negro', 'Exceso de recortes', 'Exceso de tensión en bobina', 'Falla Electrica', 'Falta capacitacion a operador', 'Falta de apriete en tornilleria', 'Falta de filo', 'Falta de penetración', 'Filo y penetración', 'Gofradora no gofra bien', 'Imanes gastados', 'Imanes mal centrados', 'Laca en material', 'Mal ajuste en rodillos naranjas', 'Mal enhebrado de máquina', 'Mal posicionamiento del timing', 'Punzones dañados', 'Rebaba en punzon', 'Revision a punzones y matriz', 'Rodamiento dañado', 'Rodillo de banda mal ajustado', 'Se aflojo base del sensor', 'Sensor de alimentacion y velocidad', 'Tiempo de uso', 'Troquel en mal estado', 'Troquel gastado'
                            ]} value={formData.causa} onChange={handleInputChange} />
                            <InputField label="Tiempo de intervención (Minutos)" name="tiempoIntervencion" type="number" value={formData.tiempoIntervencion} onChange={handleInputChange} />
                            <InputField label="Tiempo total de paro (Minutos)" name="tiempoParo" type="number" value={formData.tiempoParo} onChange={handleInputChange} />

                            <div className="mb-3">
                                <label className="block text-white font-medium mb-1">Comentarios</label>
                                <textarea
                                    name="comentarios"
                                    rows="3"
                                    className="w-full bg-white text-slate-800 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.comentarios || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <SelectField label="Ajustador" name="ajustador" options={userOptions} value={formData.ajustador} onChange={handleInputChange} />
                            <SelectField label="Operador" name="operador" options={userOptions} value={formData.operador} onChange={handleInputChange} />
                        </div>

                        {/* Modal Footer (Buttons matching image) */}
                        <div className="p-4 bg-[#111827] border-t border-slate-600 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow transition-colors uppercase text-sm flex items-center gap-2">
                                <Save size={18} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
