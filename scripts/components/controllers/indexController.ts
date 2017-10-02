/// <reference path="../_app.ts" />
module app {
    'use strict';

    export interface IIndexControllerScope extends cvController.ICVControllerScope {}

    export class IndexController extends CvController {

        public static $inject = [
            '$scope',
            'cvPruebasBaseController',
            '$routeParams'
        ];
        constructor($scope: IIndexControllerScope, private baseController: CvPruebasBaseController) {
            super($scope, true, baseController);
            this.baseController.navegarA("index/index2.html");
        }

    }
}