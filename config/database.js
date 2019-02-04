// Usamos una base de datos u otra en función de la variable process.env.NODE_ENV

if (process.env.NODE_ENV == "production") {

    module.exports = {mongoURI: 'mongodb://andreasjsdev:andreasdev2018@ds125938.mlab.com:25938/sugguest'}

} else {

    module.exports = {mongoURI: 'mongodb://localhost/sugguest'}
    
};