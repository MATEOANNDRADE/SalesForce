const express = require('express');
const bodyParser = require('body-parser');

// Importa tu archivo proxy
const proxy = require('./api/proxy');

const app = express();
const PORT = 3000;

// Middleware para analizar JSON
app.use(bodyParser.json());

// Ruta para manejar el login
app.post('/login', proxy);

// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});