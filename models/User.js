const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var _ = require('lodash');
const bcrypt = require('bcryptjs');


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
    },
    accept_terms: {
        type: Boolean,
        required: true
    }
});

///// MÉTODOS PARA LAS INSTANCIAS DE USUARIO  "user" /////

// Mejoramos lo que devolvemos de mongoDB (no necesitamos la contraseña) Más seguridad
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']); //no devolvemos la contraseña ni el token, son datos sensibles.
};


// Método que genera el token para cada usuario y lo guarda en base de datos asignado al usuario
UserSchema.methods.generateAuthToken = function() {

    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(),access: access}, 'abc123', {expiresIn: 3600}).toString();

    user.tokens = user.tokens.concat([{access: access, token:token}]);

    return user.save().then(()=> {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};


///// MÉTODOS PARA EL MODELO DE USUARIO "User" /////

UserSchema.statics.findByToken = function (token) {

    var User = this;

    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123')
    } catch (error) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })

};


UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email: email}).then((user) => {
        
        if (!user) {
            return Promise.reject();
        } 

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) {
                    resolve(user);
                } else {
                    reject();
                }
            })
        })

    })
}


UserSchema.pre('save', function(next) {
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }

});


// Exportamos el modelo para poder usarlo
module.exports = mongoose.model('user', UserSchema);