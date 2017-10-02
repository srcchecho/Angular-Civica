
// <reference path="../_app.ts" />
module app {
    'use strict';

	export class CvController extends cvController.CVController{

        constructor($scope: cvController.ICVControllerScope, grid: boolean, baseController: cvController.CVBaseController) {
			super($scope,grid,baseController);
		}

		
	}
}