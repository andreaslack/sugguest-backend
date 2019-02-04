// Dependencias
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var _ = require('lodash');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// Map global promise
mongoose.Promise = global.Promise;
// DB CONFIG
const db = require('./config/database');
// Connect to mongoose
mongoose.connect(db.mongoURI, {useNewUrlParser: true}).then(() => console.log('mongoDB connected')).catch(err => console.log(err));

require('./models/User');
const User = mongoose.model('user');




// Rutas
app.get('/prueba', (req, res) => {
    res.send('Back-end de sugguest')
});


// Ruta registro de usuarios
app.post('/users/register', (req, res) => {

    var body = _.pick(req.body, ['name','email', 'password']);
    var user = new User(body);


    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {

        res.header('x-auth', token).send(user);
        console.log(user);

    }).catch((e) => {
        res.status(400).send(e);
    });

});











// SERVIDOR Y PUERTO
const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Servidor arrancado en puerto ${port}`);
});