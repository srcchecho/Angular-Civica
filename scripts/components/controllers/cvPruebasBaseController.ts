
// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface ICvPruebasBaseController extends ng.IScope {
    }

    export class CvPruebasBaseController extends cvController.CVBaseController {

        public static $inject = [
            '$rootScope',
            '$location',
            '$filter',
            '$mdDialog',
            '$timeout',
            '$interval',
            'servicioAlbums'
        ];   
        
        constructor($rootScope: ng.IScope,
            $location: ng.ILocationService,
            public f: ng.IFilterService,
            public $mdDialog: any,
            public $timeout: ng.ITimeoutService,
            public $interval: ng.IIntervalService,
            public servicioAlbums: ServicioAlbums,
            public servicioSeguridad: cvSeguridad.IServicioSeguridad,
            public servicioCache: cvSeguridad.ServicioSeguridadCache,
            public servicioConfiguracion: cvUtil.CVServicioConfiguracion
           
            ) {
             super($rootScope,
                $location,
                null,
                null,
                f,
                null,
                null,
                null,
                $timeout,
                $interval,
                servicioSeguridad,
                servicioCache,
                servicioConfiguracion);
        }

     }
}