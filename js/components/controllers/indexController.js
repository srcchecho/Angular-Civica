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
    var IndexController = (function (_super) {
        __extends(IndexController, _super);
        function IndexController($scope, baseController) {
            var _this = _super.call(this, $scope, true, baseController) || this;
            _this.baseController = baseController;
            _this.baseController.navegarA("index/index2.html");
            return _this;
        }
        return IndexController;
    }(app.CvController));
    IndexController.$inject = [
        '$scope',
        'cvPruebasBaseController',
        '$routeParams'
    ];
    app.IndexController = IndexController;
})(app || (app = {}));
