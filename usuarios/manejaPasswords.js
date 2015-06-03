/** http://stackoverflow.com/a/14015883/1015046 **/
var bcrypt = require('bcrypt');

module.exports.encriptar = function (password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            return callback(err);

        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });

    });
};

module.exports.verificar = function (password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function (err, isPasswordMatch) {
        if (err)
            return callback(err);
        return callback(null, isPasswordMatch);
    });
};