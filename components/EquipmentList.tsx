import React, { useState, useEffect } from 'react';
import { getEquipment, addEquipment, deleteEquipment, Equipment } from '../services/equipmentService';

const EquipmentList: React.FC = () => {
    const [items, setItems] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [type, setType] = useState('Inversor');
    const [description, setDescription] = useState('');

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
            await addEquipment({ name, type, description, specs: {} });
            setName('');
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
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
                            placeholder="Ex: Canadian 550W"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option>Inversor</option>
                            <option>Módulo</option>
                            <option>Estrutura</option>
                            <option>Proteção</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none"
                            placeholder="Breve descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-slate-900 text-white py-2 px-6 rounded-lg font-bold hover:bg-slate-800 transition"
                    >
                        Adicionar
                    </button>
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
                        <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block my-2">{item.type}</p>
                        <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentList;
