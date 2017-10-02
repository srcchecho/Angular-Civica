/// <reference path="../_app.ts" />
module app {
    'use strict';

	// Servicio ServicioClienteBase
    export class ServicioAlbumBase extends cvUtil.ServicioBase{
    
     	private static URL_SERVICIO: string = "";

        constructor($http: ng.IHttpService, $location: ng.ILocationService, mensajePopup: any) {
            super($http, $location, ServicioAlbumBase.URL_SERVICIO, mensajePopup,null,null);
        }


    }
}