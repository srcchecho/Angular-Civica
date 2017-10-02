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
    var contactCtrl = (function (_super) {
        __extends(contactCtrl, _super);
        function contactCtrl($scope, baseController) {
            var _this = _super.call(this, $scope, false, baseController) || this;
            _this.baseController = baseController;
            $scope.submit = function (value) {
                alert(value);
            };
            _this.obtenerAlbums();
            return _this;
        }
        contactCtrl.prototype.obtenerAlbums = function () {
            var _this = this;
            this.baseController.servicioAlbums.obtenerListaAlbums(function (data) {
                _this.albums = data;
            });
        };
        return contactCtrl;
    }(app.CvController));
    contactCtrl.$inject = [
        '$scope',
        'cvPruebasBaseController'
    ];
    app.contactCtrl = contactCtrl;
})(app || (app = {}));
