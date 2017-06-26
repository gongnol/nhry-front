/**
 * @ngdoc Service
 * @name nh_restLocalService
 *
 * 本地文件请求服务
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.factory('restLocalService', restLocalService);

	restLocalService.$inject = ['Restangular'];

	function restLocalService(Restangular) {

		var baseUrl = 'scripts/api';

		var rest = Restangular.withConfig(function (configurer) {
			configurer.setBaseUrl(baseUrl);
		})

		return {
			userInfo: function () {
				return rest.all('userInfo.json').getList();
			},
			ORGs: function () {
				return rest.all('ORGs.json').getList();
			}
		}
	}

})();