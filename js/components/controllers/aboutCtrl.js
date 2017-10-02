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
    var aboutCtrl = (function (_super) {
        __extends(aboutCtrl, _super);
        function aboutCtrl($scope, baseController) {
            var _this = _super.call(this, $scope, false, baseController) || this;
            _this.baseController = baseController;
            return _this;
        }
        return aboutCtrl;
    }(app.CvController));
    aboutCtrl.$inject = [
        '$scope',
        'cvPruebasBaseController'
    ];
    app.aboutCtrl = aboutCtrl;
})(app || (app = {}));
