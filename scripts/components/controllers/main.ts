/// <reference path="../_app.ts" />
module app {
    'use strict';
    export interface IMainControllerScope extends cvController.ICVControllerScope {
        vmPrincipal: MainController;

    }
    export class MainController extends CvController {
        public static $inject = [
            '$scope',
            'cvPruebasBaseController',
            '$routeParams'
        ];


        private originatorEv: any;
        public version: string = "";
        public ventanaVisible: boolean = false;

        constructor($scope: IMainControllerScope, public baseController: CvPruebasBaseController) {
            super($scope, false, baseController);
            $scope.vmPrincipal = this;

    }

}
}