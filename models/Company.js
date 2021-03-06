const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const jwt = require('jsonwebtoken');
var _ = require('lodash');


// Creamos el esquema de la empresa
const CompanySchema = new Schema({
    name_responsible: { 
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    company_name: { 
        type: String,
        required: true,
        minlength: 1,
        unique: true,
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
    description: {
        type: String
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
    image_profile: {
        type: String
    },
    image_background: {
        type: String
    },
    web: {
        type: String
    },
    category: {
        type: String
    },
    colors: [{
        principal: String,
        secondary: String,
        other: String
    }],
    nif: {
        type: Number,
        required: true
    },
    duns: {
        type: Number,
    },
    verified: {
        type: Boolean,
        default: false
    },
    rating: [{
        rating_user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        rating_value: {
            type: Number,
            min: 0,
            max: 5
        },
        rating_date: {
            type: Date,
            default: Date.now
        }
    }],
    questionnaire: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
        minlength: 9
    },
    twitter_account: {
        type: String
    },
    linkedin_account: {
        type: String
    },
    opinions: [{
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            minlength: 10,
            required: true,
        }
    }],
    suggestions: [{
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            minlength: 10,
            required: true,
        },
        likes: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                }
            }
        ]
    }],
    claims: [{
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            minlength: 10,
            required: true,
        }
    }]
});



// Mejoramos lo que devolvemos de mongoDB (no necesitamos la contraseña) Más seguridad
CompanySchema.methods.toJSON = function () {
    var company = this;
    var companyObject = company.toObject();

    return _.pick(companyObject, ['_id', 'email', 'verified', 'rating', 'company_name', 'phone', 'opinions', 'description', 'suggestions']); 
}


// Método que genera el token para cada usuario y lo guarda en base de datos asignado al usuario
CompanySchema.methods.generateAuthToken = function() {

    var company = this;
    var access = 'auth';
    var token = jwt.sign({_id: company._id.toHexString(),access: access}, 'abc123').toString();

    company.tokens = company.tokens.concat([{access: access, token:token}]);

    return company.save().then(()=> {
        return token;
    });
}



// Exportamos el modelo para poder usarlo
module.exports = mongoose.model('company', CompanySchema);