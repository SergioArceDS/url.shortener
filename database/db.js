const mongoose = require('mongoose');
require('dotenv').config();

const clientDB = mongoose
.connect(process.env.URI)
.then((m) => {
    console.log('Conexion exitosa')
    return m.connection.getClient()
})
.catch((e) => {
    console.log('Error al conectar con la base de datos' + e);
})

module.exports = clientDB;