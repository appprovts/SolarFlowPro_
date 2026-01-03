import React, { useState, useEffect } from 'react';
import { getEquipment, addEquipment, deleteEquipment, Equipment } from '../services/equipmentService';

const EquipmentList: React.FC = () => {
    const [items, setItems] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [type, setType] = useState('Módulo');
    const [description, setDescription] = useState('');

    // Technical Specs
    const [pmax, setPmax] = useState('550');
    const [tolerance, setTolerance] = useState('0~+5W');
    const [vmp, setVmp] = useState('42.0');
    const [imp, setImp] = useState('13.10');
    const [voc, setVoc] = useState('50.2');
    const [isc, setIsc] = useState('13.87');
    const [efficiency, setEfficiency] = useState('21.23');

    // Inverter Technical Specs
    const [inverterSpecs, setInverterSpecs] = useState({
        // PV Input
        pvMaxPower: '7500 Wp',
        pvMaxVoltage: '550 V',
        mpptVoltageRange: '40 V a 530 V / 380 V',
        minStartVoltage: '40 V / 50 V',
        mpptCount: '2 / 1',
        maxMpptCurrent: '16 A',
        maxShortCircuitCurrent: '20 A',
        // Battery
        batteryNominalVoltage: '48 V / 51.2 V',
        batteryVoltageRange: '40 V a 60 V',
        batteryMaxPower: '5000 W / 5000 W',
        batteryMaxCurrent: '100 A / 100A',
        batteryType: 'LiFePO4',
        batteryModel: 'Aiswei Ai-LB*3',
        // AC Output
        acVoltageRange: '180 V a 280 V / 230 V',
        acFrequency: '50 Hz / 60 Hz',
        acFrequencyRange: '50 Hz ± 5Hz / 60 Hz ± 5Hz',
        acNominalPower: '5000 W / 6000 W',
        acMaxApparentPower: '5000 VA / 6000 VA',
        acNominalCurrent: '21.7 A / 26.1 A',
        acMaxCurrent: '22.7 A / 27.3 A',
        acThd: '< 3%',
        // AC Input
        acInputVoltage: '230V',
        acInputFreq: '50Hz / 60Hz',
        acInputNominalApparent: '6000 VA',
        acInputMaxApparent: '6000 VA',
        acInputNominalCurrent: '26.1 A',
        acInputMaxCurrent: '27.3 A',
        // EPS Output
        epsNominalVoltage: '230 V',
        epsNominalFreq: '50 Hz / 60 Hz',
        epsNominalApparent: '5000 VA',
        epsMaxApparent: '5000 VA',
        epsPeakApparent: '7500 VA, 10s',
        epsNominalCurrent: '21.7 A',
        epsMaxCurrent: '21.7 A',
        epsSwitchTime: '≤ 10 ms',
        epsThdi: '< 3 %',
        // Efficiency
        effMppt: '99.90 %',
        effEuroMax: '97 % / 97.6 %',
        effBatteryCharge: '94.70 %',
        // General
        dimensions: '494 / 420 / 195 mm',
        weight: '21.5 kg',
        protection: 'IP66',
        communication: 'WIFI, RS485, CAN'
    });

    const fetchItems = async () => {
        try {
            const data = await getEquipment();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const specs = type === 'Módulo' ? {
                brand,
                model,
                pmax,
                tolerance,
                vmp,
                imp,
                voc,
                isc,
                efficiency
            } : {
                brand,
                model,
                ...inverterSpecs
            };

            // Combining brand and model for the name if name is empty
            const finalName = name || `${brand} ${model}`;

            await addEquipment({
                name: finalName,
                type,
                description,
                specs
            });

            setName('');
            setBrand('');
            setModel('');
            setDescription('');
            fetchItems();
        } catch (err) {
            alert('Erro ao adicionar equipamento');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir este equipamento?')) {
            try {
                await deleteEquipment(id);
                fetchItems();
            } catch (err) {
                alert('Erro ao excluir');
            }
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Carregando equipamentos...</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Cadastrar Novo Equipamento</h3>
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Marca</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                placeholder="Ex: Canadian Solar"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Modelo</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                placeholder="Ex: CS6W-550MS"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option>Módulo</option>
                                <option>Inversor</option>
                                <option>Estrutura</option>
                                <option>Proteção</option>
                            </select>
                        </div>
                    </div>

                    {type === 'Módulo' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <InverterField label="Potência Nominal Máxima. Pmax (W)" value={pmax} onChange={setPmax} />
                            <InverterField label="Tolerância de Potência. Pmax (%)" value={tolerance} onChange={setTolerance} />
                            <InverterField label="Tensão Operacional Ideal Vmp (V)" value={vmp} onChange={setVmp} />
                            <InverterField label="Corrente Operacional Ideal Imp (A)" value={imp} onChange={setImp} />
                            <InverterField label="Tensão de Circuito Aberto Voc (V)" value={voc} onChange={setVoc} />
                            <InverterField label="Corrente de Curto-circuito Isc (A)" value={isc} onChange={setIsc} />
                            <InverterField label="Eficiência do Módulo (%)" value={efficiency} onChange={setEfficiency} />
                        </div>
                    ) : type === 'Inversor' ? (
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-slate-900 border-l-4 border-amber-400 pl-3">Entrada FV</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                                <InverterStateField label="Potência máx. módulos (STC)" field="pvMaxPower" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Tensão entrada máx." field="pvMaxVoltage" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Faixa MPPT / Tensão Nominal" field="mpptVoltageRange" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Tensão mínima op." field="minStartVoltage" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="MPPTs / Strings" field="mpptCount" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Corrente máx. MPPT" field="maxMpptCurrent" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Corrente curto-circuito MPPT" field="maxShortCircuitCurrent" state={inverterSpecs} setState={setInverterSpecs} />
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 border-l-4 border-amber-400 pl-3">Entrada Bateria</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                                <InverterStateField label="Tensão nominal bateria" field="batteryNominalVoltage" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Faixa tensão bateria" field="batteryVoltageRange" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Potência máx. carga/desca." field="batteryMaxPower" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Corrente máx. carga/desca." field="batteryMaxCurrent" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Tipo bateria" field="batteryType" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Modelo compatível" field="batteryModel" state={inverterSpecs} setState={setInverterSpecs} />
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 border-l-4 border-amber-400 pl-3">Saída CA</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                                <InverterStateField label="Intervalo tensão / Nominal" field="acVoltageRange" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Frequência nominal" field="acFrequency" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Potência nominal CA" field="acNominalPower" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Potência máx. aparente" field="acMaxApparentPower" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Corrente saída nominal" field="acNominalCurrent" state={inverterSpecs} setState={setInverterSpecs} />
                                <InverterStateField label="Corrente saída máx." field="acMaxCurrent" state={inverterSpecs} setState={setInverterSpecs} />
                            </div>
                        </div>
                    ) : null}

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição Adicional (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                placeholder="Garantia, tecnologia, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-slate-900 text-white py-2 px-8 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg self-end"
                        >
                            <i className="fas fa-plus mr-2"></i> Adicionar
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <i className={`fas ${item.type === 'Inversor' ? 'fa-plug' : 'fa-th'}`}></i>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id!)}
                                className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        <div className="flex gap-2 my-2">
                            <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{item.type}</p>
                            {item.specs?.brand && <p className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.specs.brand}</p>}
                        </div>

                        {item.specs && (
                            <div className="space-y-2 mt-4 border-t border-slate-50 pt-4">
                                {item.type === 'Módulo' ? (
                                    <>
                                        <SpecItem label="Potência Nominal Máxima. Pmax" value={item.specs.pmax} unit="W" />
                                        <SpecItem label="Tolerância de Potência. Pmax" value={item.specs.tolerance} />
                                        <SpecItem label="Tensão Operacional Ideal Vmp" value={item.specs.vmp} unit="V" />
                                        <SpecItem label="Corrente Operacional Ideal Imp" value={item.specs.imp} unit="A" />
                                        <SpecItem label="Tensão de Circuito Aberto Voc" value={item.specs.voc} unit="V" />
                                        <SpecItem label="Corrente de Curto-circuito Isc" value={item.specs.isc} unit="A" />
                                        <SpecItem label="Eficiência do Módulo" value={item.specs.efficiency} unit="%" />
                                    </>
                                ) : (
                                    <>
                                        <SpecItem label="Potência máx. (STC)" value={item.specs.pvMaxPower} />
                                        <SpecItem label="Tensão entrada máx." value={item.specs.pvMaxVoltage} />
                                        <SpecItem label="Potência nominal CA" value={item.specs.acNominalPower} />
                                        <SpecItem label="Eficiência Máxima" value={item.specs.effEuroMax} />
                                        <details className="mt-2 group/specs">
                                            <summary className="text-[10px] font-bold text-amber-600 cursor-pointer uppercase hover:text-amber-700 list-none flex items-center gap-1">
                                                <i className="fas fa-chevron-right text-[8px] transition-transform group-open/specs:rotate-90"></i>
                                                Ver ficha técnica completa
                                            </summary>
                                            <div className="space-y-1 mt-2 pl-2 border-l-2 border-amber-100 bg-slate-50 p-2 rounded-r-lg">
                                                <p className="text-[9px] font-extrabold text-slate-400 uppercase mb-1">Entrada FV</p>
                                                <SpecItem label="MPPT / Nominal" value={item.specs.mpptVoltageRange} />
                                                <SpecItem label="MPPTs / Strings" value={item.specs.mpptCount} />
                                                <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-2 mb-1">Bateria</p>
                                                <SpecItem label="Tensão Bateria" value={item.specs.batteryNominalVoltage} />
                                                <SpecItem label="Modelo Bateria" value={item.specs.batteryModel} />
                                                <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-2 mb-1">Saída EPS</p>
                                                <SpecItem label="Saída EPS" value={item.specs.epsNominalApparent} />
                                                <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-2 mb-1">Geral</p>
                                                <SpecItem label="Dimensões" value={item.specs.dimensions} />
                                                <SpecItem label="Peso" value={item.specs.weight} />
                                            </div>
                                        </details>
                                    </>
                                )}
                            </div>
                        )}
                        {item.description && <p className="text-xs text-slate-400 mt-4 italic line-clamp-2">{item.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SpecItem = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
    <div className="flex justify-between text-[11px]">
        <span className="text-slate-400 font-medium">{label}:</span>
        <span className="text-slate-700 font-bold">{value}{unit}</span>
    </div>
);

const InverterField = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-400 uppercase">{label}</label>
        <input
            type="text"
            className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const InverterStateField = ({ label, field, state, setState }: { label: string, field: string, state: any, setState: any }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-400 uppercase">{label}</label>
        <input
            type="text"
            className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
            value={state[field]}
            onChange={(e) => setState({ ...state, [field]: e.target.value })}
        />
    </div>
);

export default EquipmentList;
