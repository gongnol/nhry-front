/** 
 *  计算订单行金额，截止日期
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('calentryDirective', function() {
			return {
				restrict: 'A',
				link: function($scope, iElm, iAttrs, controller) {
					iElm.on('change', function() {
						$scope.calentry(iAttrs.rownum);
					});
				}
			};
		});
})();