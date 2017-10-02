/// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface IContactControllerScope extends cvController.ICVControllerScope {}

    export class contactCtrl extends CvController {

        public static $inject = [
            '$scope', 
            'cvPruebasBaseController'
        ];

        public dataArray;
        public albums: any;

        constructor($scope: IContactControllerScope, private baseController: CvPruebasBaseController ) {
            super($scope, false, baseController);
            $scope.submit = function(value){
                alert(value)
            }

            this.obtenerAlbums();
            
        }

         public obtenerAlbums(){
            this.baseController.servicioAlbums.obtenerListaAlbums((data)=>{
                this.albums = data;
            })
        }

    }
}