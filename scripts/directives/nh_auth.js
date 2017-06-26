/** 控件级权限控制指令
 *  
 */
(function () {
	'use strict';
	angular
		.module('newhope')
		.directive('nhAuth', ['$rootScope', nhAuthDirective]);

	function nhAuthDirective($rootScope) {
		return {
			restrict: 'A',
			link: nhAuthDirectiveLink
		}

		function nhAuthDirectiveLink(scope, ele, attrs) {
			var flag = $rootScope.access.hasAccOfThis(attrs.nhAuth);
			if (!flag) {
				if (typeof(attrs.nhAuthDisabled) != 'undefined') {
					ele.prop('disabled', 'true')
				} else {
					ele.remove();
				}
			}
		}
	}
})();