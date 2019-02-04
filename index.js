// Dependencias
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Rutas
app.get('/prueba', (req, res) => {
    res.send('Back-end de sugguest')
});



// SERVIDOR Y PUERTO
const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Servidor arrancado en puerto ${port}`);
});