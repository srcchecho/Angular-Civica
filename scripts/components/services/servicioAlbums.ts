/// <reference path="../_app.ts" />
module app {
    'use strict';
    
	// Servicio ServicioCliente
    export class ServicioAlbums extends ServicioAlbumBase{
    
        constructor($http: ng.IHttpService, $location: ng.ILocationService) {
            super($http, $location, null);
            
        }


        public obtenerListaAlbums(successCallback: Function) {
            this.httpService.get("https://proyecto-final-srcchecho.c9users.io/ios/profesor")
            .then(data=>{
                console.log(data);
                successCallback(data.data);
            }).catch((error)=>{
                console.log(error);
                successCallback(error);
            })
        }

        public obtenerDetalleAlbum(id: number, successCallback: Function) {
            this.httpService.get("https://proyecto-ios-toniarcogarcia.c9users.io/ios/profesor/"+id)
            .then(data=>{
                console.log(data);
                successCallback(data.data);
            }).catch((error)=>{
                console.log(error);
                successCallback(error);
            })
        }

	}
                	
}