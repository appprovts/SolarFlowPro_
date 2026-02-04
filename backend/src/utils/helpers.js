module.exports = {
    formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
    generateId: () => Math.random().toString(36).substr(2, 9),
};
