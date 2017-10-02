var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../_app.ts" />
var app;
(function (app) {
    'use strict';
    var NavController = (function (_super) {
        __extends(NavController, _super);
        function NavController($scope, baseController, $mdSidenav) {
            var _this = _super.call(this, $scope, false, baseController) || this;
            _this.baseController = baseController;
            _this.mdSidenav = $mdSidenav;
            $scope.abrir = function () {
                $mdSidenav('left').toggle();
            };
            $scope.todos = [
                {
                    what: 'Inicio',
                    url: '',
                    page: 'page1'
                },
                {
                    what: 'Civica',
                    url: 'about',
                    page: 'page2'
                },
                {
                    what: 'Servicios',
                    url: 'servicios',
                    page: 'page3'
                },
                {
                    what: 'Portafolio',
                    url: 'portafolio',
                    page: 'page4'
                },
                {
                    what: 'Contacto',
                    url: 'contact',
                    page: 'page4'
                }
            ];
            return _this;
        }
        NavController.prototype.navegar = function (ruta) {
            this.baseController.navegarA(ruta);
            this.mdSidenav('left').close();
        };
        return NavController;
    }(app.CvController));
    NavController.$inject = [
        '$scope',
        'cvPruebasBaseController',
        '$mdSidenav'
        //'helpService'
    ];
    app.NavController = NavController;
})(app || (app = {}));
