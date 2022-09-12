const User = require('../models/User');
const {validationResult} = require('express-validator')
const {nanoid} = require('nanoid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const registerUser = async(req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/register');
    } 

    const  { userName, email, password }  = await req.body;
    try {
        let user = await User.findOne({email: email});
        if(user) throw new Error('Ya existe el usuario');

        user = new User({userName, email, password, tokenConfirm: nanoid()});
        await user.save();

        //Enviar correo electronico con la confirmacion de la cuenta
        var transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.userEmail,
              pass: process.env.passEmail
            }
          });

        await transport.sendMail({
            from: '"Sergio Gonzalez" <sergioarce777@hotmail.com>',
            to: user.email,
            subject: "Verifica tu cuenta de correo",
            text: "Buen dia",
            html: `<a href="http://localhost:5000/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aqui</a>`
        });

        req.flash("mensajes", [{
            msg: "Revisa tu correo electronico y valida tu cuenta"
        }]);

        res.redirect('/auth/login');

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/register');
    }
}

const registerForm = (req, res) => {
    res.render('register');
}

const confirmarCuenta = async(req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({tokenConfirm: token});
        if(!user) throw new Error('No existe este usuario');

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        res.redirect('/auth/login');
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/login");
    }
}

const loginForm = (req, res) => {
    res.render('login');
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/login');
    } 
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) throw new Error('No existe este email');

        if(!user.cuentaConfirmada) throw new Error('Falta confirmar la cuenta');
    
        if(!await user.comparePassword(password)) throw new Error('Contraseña invalida'); //Se compara que la contraseña sea correcta
        
        //Creando la sesion de usuario a traves de passport
        req.login(user, function(err){
            if(err) throw new Error('Error al crear la sesion');
            return res.redirect('/');
        });

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
        //console.log(error);
        //return res.send(error.message);
    }
}

const cerrarSesion = (req, res) => {
    req.logout(() => {

        res.redirect('/auth/login');
    });
}


module.exports = {
    loginForm,
    registerForm,
    registerUser, 
    confirmarCuenta,
    loginUser,
    cerrarSesion,
}