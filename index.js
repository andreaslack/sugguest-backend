// Dependencias
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var _ = require('lodash');
const jwt = require('jsonwebtoken');
const { authenticate } = require('./config/authenticate');
const bcrypt = require('bcryptjs');


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




// ----- Ruta registro para usuarios ----- //
app.post('/register/user', (req, res) => {

    var body = _.pick(req.body, ['name','email', 'password','accept_terms']);
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



// ----- Ruta registro para empresas ----- //
app.post('/register/company', (req, res) => {
    
    var body = _.pick(req.body, ['web','rating','nif','company_name','name_responsible','email', 'password','phone', 'verified', 'opinions', 'description']);
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



// ----- Nos devuelve los datos del usuario que coincida con el token de la cabecera de la petición (PASA POR EL MIDDLEWARE) ----- //
app.get('/user/profile', authenticate, (req, res) => {
    res.send(req.user);
});



// ----- Login para usuarios, comprueba por email si hay un usuario y luego con el compare la contraseña y se genera el token. ----- //
app.post('/user/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send();
    })

});


// ----- Elimina el token del usuario ----- //
app.delete('/user/logout', authenticate,(req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});




// ----- Nos devuelve los datos visibles de todas las empresas. ----- //
app.get('/companies', (req, res) => {
    Company.find({}, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).send(result);
        }
    });
});




// ----- Nos devuelve la información pública de una empresa pasada por parámetro en la URL ----- //
app.get('/:company_name', (req, res) => {
    
    var company = req.params.company_name;
    console.log(company);
   
    Company.find({company_name: company}).then((company) => {
        if(!company) {
            res.status(400).send();
        } 

        res.send(company);

    }).catch((e) => {
        res.status(400).send();
    })

});









// ***** SERVIDOR Y PUERTO ***** //
const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Servidor arrancado en puerto ${port}`);
});