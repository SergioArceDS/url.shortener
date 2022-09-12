const Url = require('../models/Url');
const {nanoid} = require('nanoid');

const leerUrls = async(req, res) => {
    try {
        const urls = await Url.find({user: req.user.id}).lean();
        res.render("home", { titulo: "Página de inicio", urls: urls });
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }
}

const agregarUrl = async(req, res) => {
    const {origin} = req.body;
    try {
        const url = new Url({origin: origin, shortURL: nanoid(8), user: req.user.id});
        await url.save();
        res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }
}

const eliminarUrl = async(req, res) => {
    const {id} = req.params;
    try {
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url");
        }

        await url.remove();
        req.flash("mensajes", [{msg: "Url eliminada"}]);
        res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }
}

const editarUrlForm = async(req, res) => {
    const { id } = req.params;
    try {
        const url  = await Url.findById(id).lean();

        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url");
        }
        res.render("home", {url});
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }
}

const editarUrl = async(req, res) => {
    const { id } = req.params;
    const { origin } = req.body;
    try {
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url");
        }

        await Url.updateOne({origin});
        req.flash("mensajes", [{msg: "Url editada"}]);
        
        res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{msg: "No existe esta url configurada"}]);
        return res.redirect("/");
    }
}  

const redireccionamiento = async(req, res) => {
    
    const { shortURL } = req.params;
    
    try {
        const urlDB = await Url.findOne({shortURL: shortURL});
        res.redirect(urlDB.origin);
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }
}

module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,
}