const { URL } = require('url');

const urlValidar = (req, res, next) => {
    try {
        const { origin } = req.body;
        const urlFrontend = new URL(origin);
        if(urlFrontend.origin !== "null"){
            if(
                urlFrontend.protocol === "http:" ||
                urlFrontend.protocol === "https:"
            ){
                return next();
            }
            throw new Error("Debe tener https://");
        }
        throw new Error("No valida");
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mensajes", [{msg: 'URL no valida'}]);
        }else{
            req.flash("mensajes", [{msg: error.message}]);
        }
        return res.redirect('/');
    }
}

module.exports = urlValidar;