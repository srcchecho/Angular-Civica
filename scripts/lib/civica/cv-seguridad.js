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
/// <reference path="cv-util.ts" />
var cvSeguridad;
(function (cvSeguridad) {
    'use strict';
    var CVSeguridadService = (function () {
        function CVSeguridadService() {
        }
        return CVSeguridadService;
    }());
    CVSeguridadService.$inject = [
        '$rootScope',
        '$location',
        'mensajePopup',
        'cvPopup',
        '$filter',
        'uiGridExporterConstants',
        'uiGridExporterService',
        '$mdDialog',
        '$timeout'
    ];
    cvSeguridad.CVSeguridadService = CVSeguridadService;
    var ServicioSeguridadBase = (function (_super) {
        __extends(ServicioSeguridadBase, _super);
        function ServicioSeguridadBase($http, $location, url, mensajePopup, servicioCache, $rootScope) {
            var _this = _super.call(this, $http, $location, url, mensajePopup, servicioCache, $rootScope) || this;
            _this.servicioCache = servicioCache;
            return _this;
        }
        // Array<IUsuario>
        ServicioSeguridadBase.prototype.extraerUsuarioIdentificado = function (successCallback) {
            var _this = this;
            // Comprobar la cache
            if (this.servicioCache.existeUsuarioIdentificado()) {
                successCallback(this.servicioCache.getUsuarioIdentificado());
            }
            else {
                this.getUsuarioIdentificado(function (data) {
                    _this.servicioCache.setUsuarioIdentificado(data);
                    successCallback(data);
                });
            }
        };
        // IUsuario        
        ServicioSeguridadBase.prototype.getUsuarioIdentificado = function (successCallback) {
            successCallback(null);
            /*this.ejecutarGet("/getUsuarioIdentificado", (data: IUsuario) => {
                successCallback(data);
            });*/
        };
        ServicioSeguridadBase.prototype.compruebaFuncionalidadPerfilUsuario = function (usuario, funcionalidad) {
            //usuario.forEach((perfil: IPerfil) => {
            if (cvUtil.Utilidades.comprobarObjetoVacio(usuario))
                return false;
            if (this.compruebaFuncionalidadPerfil(usuario.perfil, funcionalidad))
                return true;
            return false;
        };
        ServicioSeguridadBase.prototype.compruebaFuncionalidadPerfil = function (perfil, funcionalidad) {
            var _this = this;
            var result = false;
            // obtiene las funcionalidades del perfil del usuario y determina si tiene 
            // la funcionalidad necesaria buscada            
            var funcionalidades = perfil.funcionalidades;
            funcionalidades.forEach(function (funcionalidadUsuario) {
                if (_this.comprobarMapeoFunciones(_this.getNombreFuncionalidad(funcionalidadUsuario), funcionalidad)) {
                    //if (funcionalidadUsuario.nombre == funcionalidad) {
                    result = true;
                }
            });
            return result;
        };
        ServicioSeguridadBase.prototype.getMapeoFunciones = function () {
            var mapeo = {};
            return mapeo;
        };
        ServicioSeguridadBase.prototype.getNombreFuncionalidad = function (f) {
            return f.nombre;
        };
        /**
         * Comprueba si una funcion de la interfaz está dentro de una funcionalidad
         * definida en la base de datos.
         */
        ServicioSeguridadBase.prototype.comprobarMapeoFunciones = function (funcion, funcionalidad) {
            var mapeo = this.getMapeoFunciones();
            var funciones = mapeo[funcion];
            if (cvUtil.Utilidades.comprobarObjetoVacio(funciones))
                return false;
            for (var i = 0; i < funciones.length; i++)
                if (funciones[i] == funcionalidad)
                    return true;
            return false;
        };
        return ServicioSeguridadBase;
    }(cvUtil.ServicioBase));
    cvSeguridad.ServicioSeguridadBase = ServicioSeguridadBase;
    var ServicioSeguridadCache = (function (_super) {
        __extends(ServicioSeguridadCache, _super);
        function ServicioSeguridadCache() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ServicioSeguridadCache.prototype.setUsuarioIdentificado = function (usuario) {
            this.anadirObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO, usuario);
        };
        ServicioSeguridadCache.prototype.getUsuarioIdentificado = function () {
            return this.recuperarObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO);
        };
        ServicioSeguridadCache.prototype.existeUsuarioIdentificado = function () {
            return this.existeObjetoCache(ServicioSeguridadCache.CLAVE_USUARIO);
        };
        return ServicioSeguridadCache;
    }(cvUtil.CVServicioCache));
    ServicioSeguridadCache.CLAVE_USUARIO = "cvSegUsuario";
    cvSeguridad.ServicioSeguridadCache = ServicioSeguridadCache;
})(cvSeguridad || (cvSeguridad = {}));
