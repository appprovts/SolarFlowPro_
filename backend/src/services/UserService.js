
const UserModel = require('../models/UserModel');

class UserService {
    async findAll() {
        return await UserModel.getAll();
    }

    async findById(id) {
        return await UserModel.getById(id);
    }

    async updateRole(id, role) {
        return await UserModel.updateRole(id, role);
    }
}

module.exports = new UserService();
