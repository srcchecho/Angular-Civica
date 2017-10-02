/// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface IAboutControllerScope extends cvController.ICVControllerScope {}

    export class aboutCtrl extends CvController {

        public static $inject = [
            '$scope', 
            'cvPruebasBaseController'
        ];

        public dataArray;

        constructor($scope: IAboutControllerScope, private baseController: CvPruebasBaseController ) {
            super($scope, false, baseController);
            
        }

    }
}