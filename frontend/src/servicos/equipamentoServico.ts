import { supabase } from './supabaseCliente';

export interface Equipment {
    id?: string;
    name: string;
    type: string;
    description: string;
    specs: any;
    created_at?: string;
}

export const getEquipment = async (): Promise<Equipment[]> => {
    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'created_at'>): Promise<Equipment> => {
    const { data, error } = await supabase
        .from('equipment')
        .insert([equipment])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
    const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
