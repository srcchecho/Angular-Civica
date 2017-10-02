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
    var CvPruebasBaseController = (function (_super) {
        __extends(CvPruebasBaseController, _super);
        function CvPruebasBaseController($rootScope, $location, f, $mdDialog, $timeout, $interval, servicioAlbums, servicioSeguridad, servicioCache, servicioConfiguracion) {
            var _this = _super.call(this, $rootScope, $location, null, null, f, null, null, null, $timeout, $interval, servicioSeguridad, servicioCache, servicioConfiguracion) || this;
            _this.f = f;
            _this.$mdDialog = $mdDialog;
            _this.$timeout = $timeout;
            _this.$interval = $interval;
            _this.servicioAlbums = servicioAlbums;
            _this.servicioSeguridad = servicioSeguridad;
            _this.servicioCache = servicioCache;
            _this.servicioConfiguracion = servicioConfiguracion;
            return _this;
        }
        return CvPruebasBaseController;
    }(cvController.CVBaseController));
    CvPruebasBaseController.$inject = [
        '$rootScope',
        '$location',
        '$filter',
        '$mdDialog',
        '$timeout',
        '$interval',
        'servicioAlbums'
    ];
    app.CvPruebasBaseController = CvPruebasBaseController;
})(app || (app = {}));
