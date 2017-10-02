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
    // Servicio ServicioClienteBase
    var ServicioAlbumBase = (function (_super) {
        __extends(ServicioAlbumBase, _super);
        function ServicioAlbumBase($http, $location, mensajePopup) {
            return _super.call(this, $http, $location, ServicioAlbumBase.URL_SERVICIO, mensajePopup, null, null) || this;
        }
        return ServicioAlbumBase;
    }(cvUtil.ServicioBase));
    ServicioAlbumBase.URL_SERVICIO = "";
    app.ServicioAlbumBase = ServicioAlbumBase;
})(app || (app = {}));
