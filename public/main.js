// public/core.js
var scotchTodo = angular.module('scotchTodo', [ 'ngFileUpload']);

function mainController($scope, $http, Upload) {
    
    $scope.proyectoSeleccionado=1;
    $scope.proyectos = [];
    $scope.formData = {};


    var req = {
        method: 'GET',
        url: 'http://localhost:8100/api/v1/aenea/proyectos/all',
        headers: {
            'token': 'enolcasielles@gmail.com'
        }
    }

    $http(req)
        .success(function(data) {
            for (var i=0 ; i<data.length ; i++) {
                $scope.proyectos.push(data[i]);
                console.log($scope.proyectos[i].nombre);
            }
        })
        .error(function(data) {
            alert("No se pudo recuperar los proyectos de la base de datos");
        }); 


    //Actualiza los campos del formulario
    $scope.update = function() {
        $scope.formData = $scope.proyectos[$scope.proyectoSeleccionado];
    }



    //Limpia los datos del formulario
    $scope.limpiar = function() {
        $scope.formData = {};
    }

    //Almacena el objeto con el fichero de la imagen en el scope
    $scope.cacheImage = function (files) {
        $scope.images = files;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $scope.image = file;
                $scope.formData.imagen = '/uploads/' + file.name;
            }
        }
        console.log("Hola");
    };


    $scope.submitForm = function () {
        
        //Compruebo que se haya cargado imagen
        if (!$scope.formData.imagen) {
            alert("Has de cargar una imagen");
            return;
        }

        //Cargo los datos al servidor
        $http({
            method: 'POST',
            url: 'http://localhost:8080/api/v1/aenea/proyectos/proyecto',
            headers: {'token': 'enolcasielles@gmail.com'},
            data: $scope.formData
        }).success(function () {
            alert("Los datos han sido cargados correctamente");
        });
        $scope.upload($scope.images);
    };


    $scope.updateProyecto = function () {
        
        //Compruebo que se haya cargado imagen
        if (!$scope.formData.imagen) {
            alert("Has de cargar una imagen");
            return;
        }


        //Cargo los datos al servidor
        var url = 'http://localhost:8080/api/v1/aenea/proyectos/proyecto/' + $scope.proyectos[$scope.proyectoSeleccionado]._id;
        console.log('http://localhost:8080/api/v1/aenea/proyectos/proyecto/' + $scope.proyectos[$scope.proyectoSeleccionado]._id);
        $http({
            method: 'PUT',
            url: url,
            headers: {'token': 'enolcasielles@gmail.com'},
            data: $scope.formData
        }).success(function () {
            alert("Los datos han sido cargados correctamente");
        });
        
        if ($scope.images) {
            console.log($scope.images);
            $scope.upload($scope.images);
        }
    };



    //Sube la imagen al servidor
    $scope.upload = function (files) {
                Upload.upload({
                    url: '/upload',
                    headers: $scope.formData.imagen,
                    file: $scope.image
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
    };


    $scope.nuevoProyecto = function() {
        $http({
            method: 'GET',
            url: '/nuevoProyecto',
        }).success(function () {
           
        });
    }

}