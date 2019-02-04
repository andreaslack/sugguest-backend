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


// Importamos los modelos 
require('./models/User');
const User = mongoose.model('user');

require('./models/Company');
const Company = mongoose.model('company');



// Ruta de prueba
app.get('/prueba', (req, res) => {
    res.send('<img src="https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif">')
});




// Ruta registro para usuarios
app.post('/register/user', (req, res) => {

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



// Ruta registro para empresas
app.post('/register/company', (req, res) => {
    
    var body = _.pick(req.body, ['web','rating','nif','company_name','name_responsible','email', 'password']);
    var company = new Company(body);

    console.log(company);

    company.save().then(() => {
        return company.generateAuthToken();
    }).then((token) => {

        res.header('x-auth', token).send(company);
        console.log(company);

    }).catch((e) => {
        res.status(400).send(e);
    });

});



// Página donde mostramos cards con las empresas que tenemos en la plataforma
app.get('/companies', (req, res) => {
    Company.find({}, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).send(result);
        }
    });
})









// SERVIDOR Y PUERTO
const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Servidor arrancado en puerto ${port}`);
});