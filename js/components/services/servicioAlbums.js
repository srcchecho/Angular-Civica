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
    // Servicio ServicioCliente
    var ServicioAlbums = (function (_super) {
        __extends(ServicioAlbums, _super);
        function ServicioAlbums($http, $location) {
            return _super.call(this, $http, $location, null) || this;
        }
        ServicioAlbums.prototype.obtenerListaAlbums = function (successCallback) {
            this.httpService.get("https://proyecto-final-srcchecho.c9users.io/ios/profesor")
                .then(function (data) {
                console.log(data);
                successCallback(data.data);
            }).catch(function (error) {
                console.log(error);
                successCallback(error);
            });
        };
        ServicioAlbums.prototype.obtenerDetalleAlbum = function (id, successCallback) {
            this.httpService.get("https://proyecto-ios-toniarcogarcia.c9users.io/ios/profesor/" + id)
                .then(function (data) {
                console.log(data);
                successCallback(data.data);
            }).catch(function (error) {
                console.log(error);
                successCallback(error);
            });
        };
        return ServicioAlbums;
    }(app.ServicioAlbumBase));
    app.ServicioAlbums = ServicioAlbums;
})(app || (app = {}));
