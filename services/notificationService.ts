import { supabase } from './supabaseClient';
import { Notification } from '../types';

const mapToNotification = (row: any): Notification => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as 'info' | 'success' | 'warning',
    timestamp: new Date(row.created_at),
    isRead: row.is_read,
    projectId: row.project_id,
    action: row.action,
    actionData: row.action_data
});

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data.map(mapToNotification);
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<Notification | null> => {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            user_id: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            project_id: notification.projectId,
            action: notification.action,
            action_data: notification.actionData
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        return null;
    }

    return mapToNotification(data);
};

export const markAsRead = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }

    return true;
};

export const deleteNotification = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting notification:', error);
        return false;
    }

    return true;
};

export const clearAllNotifications = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error clearing notifications:', error);
        return false;
    }

    return true;
};
