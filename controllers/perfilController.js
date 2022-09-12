const formidable = require('formidable');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

module.exports.formPerfil = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.render("perfil", {user: req.user, imagen: user.imagen}); 
    } catch (error) {
        req.flash("mensajes", [{msg: 'Error al leer el usuario'}]); 
        res.redirect('/perfil');
    }

}

module.exports.editarFotoPerfil = async(req, res) => {
    const form = new formidable.IncomingForm();
    form.maxFileSize = 50 * 1024 * 1024 //5mb

    form.parse(req, async(err, fields, files) => {
        try {
            if(err){
                throw new Error('Falló la subida de imagen');
            }

            const file = files.myFile;

            if(file.originalFilename === ""){
                throw new Error("Por favor agrega una imagen");
            }

            const imageTypes = ['image/jpeg', 'image/png'];

            if(!imageTypes.includes(file.mimetype)){
                throw new Error("La imagen debe ser tipo .jpg o .png");
            }

            if(file.size > 50 * 1024 * 1024){
                throw new Error("La imagen debe ser menor a 5MB");
            }

            const extension = file.mimetype.split("/")[1];
            const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);

            fs.renameSync(file.filepath, dirFile); //Con esta operacion se guarda la imagen en public/img/perfiles

            //Se hace uso de Jimp para reducir el tamaño de la imagen
            const image = await Jimp.read(dirFile);
            image.resize(200, 200).quality(90).writeAsync(dirFile); //Se esta redimensionando la imagen a 200x200

            const user = await User.findById(req.user.id);
            user.imagen = `${req.user.id}.${extension}`;
            await user.save();    

            req.flash("mensajes", [{msg: "Imagen subida correctamente"}]);       
        } catch (error) {
            req.flash("mensajes", [{msg: error.message}]);
        }finally{
            res.redirect("/perfil");
        }
        

    });
}