/// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface INavControllerScope extends cvController.ICVControllerScope {}

    export class NavController extends CvController {

        public static $inject = [
            '$scope', 
            'cvPruebasBaseController',
            '$mdSidenav' 
            //'helpService'
        ];

        public mdSidenav:angular.material.ISidenavService;

        constructor($scope: INavControllerScope, private baseController: CvPruebasBaseController, $mdSidenav: angular.material.ISidenavService ) {
            super($scope, false, baseController);
            this.mdSidenav = $mdSidenav;
            $scope.abrir = function() {
                $mdSidenav('left').toggle();
            };

            $scope.todos = [
            {
                what: 'Inicio',
                url: '',
                page: 'page1'
            },
            {
                what: 'Civica',
                url: 'about',
                page: 'page2'
            },
            {
                what: 'Servicios',
                url: 'servicios',
                page: 'page3'
            },
            {
                what: 'Portafolio',
                url: 'portafolio',
                page: 'page4'
            },
            {
                what: 'Contacto',
                url: 'contact',
                page: 'page4'
            }
            ];
        }

        public navegar(ruta:string){
            this.baseController.navegarA(ruta);
            this.mdSidenav('left').close()
        }

    }
}