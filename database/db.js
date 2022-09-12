const mongoose = require('mongoose');

mongoose.connect(process.env.URI)
.then(() => {
    console.log('Conexion exitosa')
})
.catch((e) => {
    console.log('Error al conectar con la base de datos' + e);
})