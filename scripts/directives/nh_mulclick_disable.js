/** 禁止多次点击指令
 *  
 */
(function () {
	'use strict';
	angular
		.module('newhope')
		.directive('nhMulclickDisable', nhMulclickDisable);

	function nhMulclickDisable() {
		return {
			restrict: 'A',
			template: '<span ng-transclude></span>',
			transclude: true,
			link: nhMulclickDisableLink
		}

		function nhMulclickDisableLink(scope, ele, attrs) {
			scope.$watch(attrs.nhMulclickDisable, function (value) {
				if (!!value) {
					ele.prop('disabled', true);
					ele.addClass('disabled nh-disable');
					ele.children().addClass('nh-hide');
				} else {
					ele.prop('disabled', false);
					ele.removeClass('disabled nh-disable');
					ele.children().removeClass('nh-hide');
				}
			})
		}
	}
})();