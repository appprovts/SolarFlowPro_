const UserModel = require('../models/UserModel');

class UserService {
    async findAll() {
        return await UserModel.getAll();
    }

    async findById(id) {
        return await UserModel.getById(id);
    }
}

module.exports = new UserService();
