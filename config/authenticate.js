const mongoose = require('mongoose');
require('./../models/User');
const User = mongoose.model('user');


// Middleware que mira si el token corresponde a un usuario
var authenticate = (req, res, next) => {
    
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        
        if(!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        next();

    }).catch((e) => {
        res.status(401).send();
    });
}

module.exports = { authenticate };