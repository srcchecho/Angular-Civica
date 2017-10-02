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
// <reference path="../_app.ts" />
var app;
(function (app) {
    'use strict';
    var CvController = (function (_super) {
        __extends(CvController, _super);
        function CvController($scope, grid, baseController) {
            return _super.call(this, $scope, grid, baseController) || this;
        }
        return CvController;
    }(cvController.CVController));
    app.CvController = CvController;
})(app || (app = {}));
