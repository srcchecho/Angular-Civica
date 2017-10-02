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
    var MainController = (function (_super) {
        __extends(MainController, _super);
        function MainController($scope, baseController) {
            var _this = _super.call(this, $scope, false, baseController) || this;
            _this.baseController = baseController;
            _this.version = "";
            _this.ventanaVisible = false;
            $scope.vmPrincipal = _this;
            return _this;
        }
        return MainController;
    }(app.CvController));
    MainController.$inject = [
        '$scope',
        'cvPruebasBaseController',
        '$routeParams'
    ];
    app.MainController = MainController;
})(app || (app = {}));
