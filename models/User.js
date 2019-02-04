const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var _ = require('lodash');


// Creamos el esquema del usuario
const UserSchema = new Schema({
    name: { 
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    image: {
        type: String
    }
});



// Mejoramos lo que devolvemos de mongoDB (no necesitamos la contraseña) Más seguridad
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']); //no devolvemos la contraseña ni el token, son datos sensibles.
}


// Método que genera el token para cada usuario y lo guarda en base de datos asignado al usuario
UserSchema.methods.generateAuthToken = function() {

    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(),access: access}, 'abc123').toString();

    user.tokens = user.tokens.concat([{access: access, token:token}]);

    return user.save().then(()=> {
        return token;
    });
}


// Exportamos el modelo para poder usarlo
module.exports = mongoose.model('user', UserSchema);