import { supabase } from './supabaseClient';
import { Project, ProjectStatus } from '../types';

const mapToProject = (row: any): Project => ({
    id: row.id,
    clientName: row.client_name,
    address: row.address,
    status: row.status as ProjectStatus,
    powerKwp: row.power_kwp,
    estimatedProduction: row.estimated_production,
    startDate: row.start_date,
    surveyData: row.survey_data,
    concessionariaStatus: row.concessionaria_status,
    notes: row.notes,
    assignedIntegrator: row.assigned_integrator
});

const mapToRow = (project: Partial<Project>) => {
    const row: any = {};
    if (project.clientName !== undefined) row.client_name = project.clientName;
    if (project.address !== undefined) row.address = project.address;
    if (project.status !== undefined) row.status = project.status;
    if (project.powerKwp !== undefined) row.power_kwp = project.powerKwp;
    if (project.estimatedProduction !== undefined) row.estimated_production = project.estimatedProduction;
    if (project.startDate !== undefined) row.start_date = project.startDate;
    if (project.surveyData !== undefined) row.survey_data = project.surveyData;
    if (project.concessionariaStatus !== undefined) row.concessionaria_status = project.concessionariaStatus;
    if (project.notes !== undefined) row.notes = project.notes;
    if (project.assignedIntegrator !== undefined) row.assigned_integrator = project.assignedIntegrator;
    return row;
};

export const getProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    return data.map(mapToProject);
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project | null> => {
    const row = mapToRow(project);
    const { data, error } = await supabase
        .from('projects')
        .insert([row])
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        return null;
    }

    return mapToProject(data);
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const row = mapToRow(updates);
    const { data, error } = await supabase
        .from('projects')
        .update(row)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        return null;
    }

    return mapToProject(data);
};

export const deleteProject = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting project:', error);
        return false;
    }

    return true;
};
