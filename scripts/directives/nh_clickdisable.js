/** 
 *  点击禁用
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('clickdisableDirective', function() {
			return {
				restrict: 'A',
				link: function($scope, iElm, iAttrs, controller) {
					iElm.on('click', function() {
						iElm.attr("disabled",true);
						if(iAttrs.prevdisable == 'true'){
							iElm.prev().attr("disabled",true);
						}
					});
				}
			};
		});
})();