const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'SolarFlow Pro API configurada com sucesso!' });
});

module.exports = app;
