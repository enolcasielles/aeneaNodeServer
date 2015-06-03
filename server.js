// server.js

    // set up ========================
    var express  = require('express');
	var multer   = require('multer');
    var app      = express();                               // create our app w/ express
    var mongojs  = require('mongojs');
    var morgan   = require('morgan');             // log requests to the console (express4)
    var db       = mongojs('mongodb://enolcasielles:hondacrf301989@ds063630.mongolab.com:63630/aenea_data', ['usuarios','proyectos']);
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
	var fs = require('fs');



    //CORS middleware
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,token');

        next();
    }  


    // configuration =================
    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use('/uploads', express.static('uploads'));       //Apunto la ruta /uploads para que apunte al directorio 'uploads'. Esto permitira que se acceda a los ficheoros de dicha carpeta
    app.use(morgan('dev'));                                         // log every request to the console
	app.use(multer({ dest: './uploads/'}))
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(allowCrossDomain);


	
    // listen (start app with node server.js) ======================================
    app.listen(8100);
    console.log("App listening on port 8100");


    var manejaUsuarios  =   require('./usuarios/manejaUsuarios')(app, db);
    var manejaProyectos =   require('./proyectos/manejaProyectos')(app, db, fs);

	
	
	// application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


	
	
	
	