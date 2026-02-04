const db = require('../config/database');

class UserModel {
    async getAll() {
        const { rows } = await db.query('SELECT id, name, email, role FROM users');
        return rows;
    }

    async getById(id) {
        const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
        return rows[0];
    }
}

module.exports = new UserModel();
