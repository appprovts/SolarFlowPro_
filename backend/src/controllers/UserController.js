
const UserService = require('../services/UserService');

class UserController {
    async getAll(req, res) {
        try {
            const users = await UserService.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const user = await UserService.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateRole(req, res) {
        try {
            const { role } = req.body;
            const user = await UserService.updateRole(req.params.id, role);
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();
