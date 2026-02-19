
const db = require('../config/database');

class UserModel {
    async getAll() {
        // Seleciona da tabela profiles que criamos no Supabase
        const { rows } = await db.query('SELECT id, full_name as name, role, avatar_url as avatar, phone FROM public.profiles ORDER BY full_name ASC');
        return rows;
    }

    async getById(id) {
        const { rows } = await db.query('SELECT id, full_name as name, role, avatar_url as avatar, phone FROM public.profiles WHERE id = $1', [id]);
        return rows[0];
    }

    async updateRole(id, role) {
        const { rows } = await db.query('UPDATE public.profiles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [role, id]);
        return rows[0];
    }
}

module.exports = new UserModel();
