
var path = require('path');

module.exports = function (server, db, fs) {
    var validarPeticion = require("../usuarios/validaPeticion");

    //Recupera todos los proyectos
    server.get('/api/v1/aenea/proyectos/all', function (req, res) {
        validarPeticion.validar(req, res, db, function () {
            db.proyectos.find({},function (err, listado) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(listado));
            });
        });
    });   

    //Recupera el objeto que representa un proyecto a partir de su id
    server.get('/api/v1/aenea/proyectos/proyecto/:id', function (req, res) {
        validarPeticion.validar(req, res, db, function () {
            db.proyectos.find({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
        });
    });

    
    //Crea un nuevo proyecto en la base de datos
    server.post('/api/v1/aenea/proyectos/proyecto', function (req, res) {
        validarPeticion.validar(req, res, db, function () {
            var proyecto = req.body;
            //Apunto la fecha de creacion
            var fechaActual = new Date();
            var mes = fechaActual.getMonth() + 1;
            var fechaString = fechaActual.getFullYear() + "-" + mes + "-" + fechaActual.getDate();
            proyecto.fechaCreacion = fechaString;
            db.proyectos.save(proyecto,
                function (err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                }
            ); 
        });
    });


    //Upload imagen
    server.post('/upload', function (req, res) {
        var tempPath = req.files.file.path;
        var tmp = './uploads/' + req.files.file.originalname;
            console.log(tmp);
        if (path.extname(req.files.file.name).toLowerCase() === '.png') {
            fs.rename(tempPath, tmp, function(err) {
                if (err) throw err;
                console.log("Upload completed!");
            });
        } else {
            fs.unlink(tempPath, function () {
                if (err) throw err;
                console.error("Only .png files are allowed!");
            });
        }
    });


    //Descarga una imagen
    server.get('/api/v1/aenea/proyectos/imagen/:url', function(req,res) {
        validarPeticion.validar(req, res, db, function () {
            res.sendfile(req.params.url);
        });
    });


    //Actualiza el valor de un proyecto
    server.put('/api/v1/aenea/proyectos/proyecto/:id', function (req, res) {
        validarPeticion.validar(req, res, db, function () {
            db.proyectos.findOne( { _id : db.ObjectId(req.params.id) } , function (err, data) {
                var nuevo = {}; // Objeto en el que se almacena el actualizado
                // Copio en este objeto el que hay actualmente
                for (var n in data) {
                    nuevo[n] = data[n];
                }
                //Cambio aquellos parametros que recibo en req excepto su id
                for (var n in req.body) {
                    if (n != "_id")
                        nuevo[n] = req.body[n];
                }
                //Actualizo el objeto
                db.proyectos.update({
                    _id: db.ObjectId(req.params.id)
                }, nuevo, {
                    multi: false
                }, function (err, data) {
                    console.log(err);
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
            });
        });
    });

    
    //Borra un proyecto de la base de datos
    server.delete('/api/v1/aenea/proyectos/proyecto/:id', function (req, res, next) {
        validarPeticion.validar(req, res, db, function () {
            db.proyectos.remove({
                _id: db.ObjectId(req.body.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
        });
    });


    //Borra todos los proyectos de la base de datos
    server.delete('/api/v1/aenea/proyectos/all', function (req, res, next) {
        validarPeticion.validar(req, res, db, function () {
            db.proyectos.remove({}, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
        });
    });


}