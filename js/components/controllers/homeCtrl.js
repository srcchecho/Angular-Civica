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
    var homeCtrl = (function (_super) {
        __extends(homeCtrl, _super);
        function homeCtrl($scope, baseController) {
            var _this = _super.call(this, $scope, false, baseController) || this;
            _this.baseController = baseController;
            _this.dataArray = [
                {
                    src: 'img/slider1.jpg',
                    text: 'Diseño y Programacion Web',
                },
                {
                    src: 'img/slider2.jpg',
                    text: 'Desarrollo a medida',
                },
                {
                    src: 'img/slider3.jpg',
                    text: 'Soluciones Móviles y Multiplataforma',
                }
            ];
            return _this;
        }
        return homeCtrl;
    }(app.CvController));
    homeCtrl.$inject = [
        '$scope',
        'cvPruebasBaseController'
    ];
    app.homeCtrl = homeCtrl;
})(app || (app = {}));
