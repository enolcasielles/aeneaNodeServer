var pwdMgr = require('./manejaPasswords');

module.exports = function (server, db) {
    // Indice unico
    db.usuarios.ensureIndex({
        email: 1
    }, {
        unique: true
    })

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
};