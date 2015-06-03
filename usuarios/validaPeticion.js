var validaEmail = function (db, email, callback) {
    console.log(email);
    db.usuarios.findOne({
        email: email
    }, function (err, user) {
        callback(user);
    });
};

module.exports.validar = function (req, res, db, callback) {
    // Comprueba que se haya recibido el mail del usuario como token
    if (!req.headers.token) {
        console.log(req.headers.token);
        res.writeHead(403, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            error: "No estas autorizado para acceder a esta aplicacion",
            message: "No has enviado un token adecuado"
        }));
        return;
    };


    validaEmail(db, req.headers.token, function (user) {
        if (!user) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "You are not authorized to access this application",
                message: "Token no valido"
            }));
        } else {
            callback();
        }
    });
};