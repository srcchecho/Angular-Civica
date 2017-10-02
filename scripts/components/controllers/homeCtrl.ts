/// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface IHomeControllerScope extends cvController.ICVControllerScope {}

    export class homeCtrl extends CvController {

        public static $inject = [
            '$scope', 
            'cvPruebasBaseController'
        ];

        public dataArray;

        constructor($scope: IHomeControllerScope, private baseController: CvPruebasBaseController ) {
            super($scope, false, baseController);
            
            this.dataArray = [
                {
                    src: 'img/slider1.jpg',
                    text: 'Diseño y Programacion Web',
                },
                {
                    src: 'img/slider2.jpg',
                    text: 'Desarrollo a medida',
                },
                {
                    src: 'img/slider3.jpg',
                    text: 'Soluciones Móviles y Multiplataforma',
                }
            ];
        }

    }
}