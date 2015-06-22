var pwdMgr = require('./manejaPasswords');

module.exports = function (server, db) {

    var validarPeticion = require("./validaPeticion");

    // Indice unico
    db.usuarios.ensureIndex({
        email: 1
    }, {
        unique: true
    })

    /**
     ** Punto de entrada para crear un nuevo usuario en la base de datos
     ** Como body se ha de enviar el objeoto con los datos del usario a almacenar
     */
    server.post('/api/v1/aenea/usuarios/registra', function (req, res, next) {
        var user = req.body;
        if (user.social != "NO") {  //Encripto la contraseña e inserto al usuario
            pwdMgr.encriptar(user.password, function (err, hash) {
                user.password = hash;
                db.usuarios.insert(user, function (err, dbUser) {
                    if (err) { // Usiario duplicado
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(400, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                error: err,
                                message: "Email ya registrado"
                            }));
                        }
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        dbUser.password = "";
                        res.end(JSON.stringify(dbUser));
                    }
                });
            });
        }

        else {  //Inserto al usuario si aun no estaba registrado
                db.usuarios.insert(user, function (err, dbUser) {
                    if (err) { // Usiario duplicado
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(200, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            dbUser.password = "";
                            res.end(JSON.stringify(dbUser));
                        }
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        dbUser.password = "";
                        res.end(JSON.stringify(dbUser));
                    }
                });
        }

        function insertaUsuario(user) {
            db.usuarios.insert(user, function (err, dbUser) {
                if (err) { // Usiario duplicado
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(400, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                error: err,
                                message: "Email ya registrado"
                            }));
                        }
                } else {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        dbUser.password = "";
                        res.end(JSON.stringify(dbUser));
                }
            });
        }

    });

    
    /**
     ** Punto de entrada para loggear a un usuario
     ** Como body se ha de enviar el objeto con los datos para verificar el login (email y contraseña)
     */
    server.post('/api/v1/aenea/usuarios/login', function (req, res, next) {
        var user = req.body;
        console.log(user.password);
        if (user.email.trim().length == 0 || user.password.trim().length == 0) {
            //No se deberia dar nunca ya que se ha de verificar en el cliente
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "Datos no validos"
            }));
        }
        db.usuarios.findOne({
            email: user.email  
        }, function (err, dbUser) {

            if (dbUser == null) {
                res.writeHead(403, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    error: "Datos incorrectos"
                }));
            }
            pwdMgr.verificar(user.password, dbUser.password, function (err, isPasswordMatch) {

                if (isPasswordMatch) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    // remove password hash before sending to the client
                    dbUser.password = "";
                    res.end(JSON.stringify(dbUser));
                } else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        error: "Datos incorrectos"
                    }));
                }

            });
        });
    });


    /**
     ** Punto de entrada para obtener los datos de un usuario
     ** En la ultima parte de la url se ha de enviar el email del usuario a obtener
     */
    server.get('/api/v1/aenea/usuarios/usuario/:email', function(req,res,next) {
        db.usuarios.findOne({
            email: email  
        }, function (err, dbUser) {
            
            if (dbUser == null) {
                res.writeHead(403, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    error: "No hay ningun usuario registrado con ese email"
                }));
            }

            //Si llega aqui se habra recuperado correctamente, se sobrescribe su contraseña y se envia el objeto
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            dbUser.password = "";
            res.end(JSON.stringify(dbUser));

        });
    });


    /**
     ** Punto de entrada para actualizar el estado de un usuario
     ** En la ultima parte de la url se ha de enviar el id del usuario a actualizar.
     ** Como request se ha de enviar el ojeto con los datos a cambiar del usuario
     ** Como header se ha de enviar un token valido
     */
    server.put('/api/v1/aenea/usuarios/usuario/:id',function(req,res,next) {

        validarPeticion.validar(req, res, db, function () {
            db.usuarios.findOne( { _id : db.ObjectId(req.params.id) } , function (err, data) {
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
                db.usuarios.update({
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



};