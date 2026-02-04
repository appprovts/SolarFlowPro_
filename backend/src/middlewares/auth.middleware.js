module.exports = (req, res, next) => {
    // Simulação de middleware de autenticação
    const token = req.headers['authorization'];

    if (!token) {
        // Para simplificar o esqueleto, permitimos passar se estiver em dev
        // return res.status(401).json({ message: 'Acesso negado' });
        console.log('Middleware: Sem token, mas prosseguindo no esqueleto.');
    }

    next();
};
