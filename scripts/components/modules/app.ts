/// <reference path="../_app.ts" />
module app {
    'use strict';
    angular.module('app', ['ngRoute'])

     .service('cvPruebasBaseController', CvPruebasBaseController) 
     .controller('index', IndexController)  
     .controller('main', MainController)  

        .config(['$routeProvider', function routes($routeProvider: ng.route.IRouteProvider) {
            $routeProvider            
                .when("index", {
                    templateUrl: '/index.html'
                })
                .otherwise({
                    redirectTo: '/index.html'
                });
        }]);      
}
