const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, UserController.getAll);
router.get('/:id', authMiddleware, UserController.getById);

module.exports = router;
