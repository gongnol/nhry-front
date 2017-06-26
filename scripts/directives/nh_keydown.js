/** 
 *  禁用鼠标点击事件
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('nhKeydown', function() {
			return {
				restrict: 'A',
				link: function(scope, ele, attrs) {
					ele.on('keydown', 'input', function (evt) {
						if (evt.which === 13) {
							evt.preventDefault();
						}
					})
				}
			};
		});
})();