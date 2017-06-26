/**
 * @ngdoc Service
 * @name nh_tableService
 *
 * 码表查询服务
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.factory('codeMapService', codeMapService);

	codeMapService.$inject = ['restLocalService', 'restService', 'nhHttp'];

	function codeMapService(restLocalService, restService, nhHttp) {

		return {
			
			provinces: function () {
				return restService.provinces();
			},
			ORGs: function () {
				return restLocalService.ORGs().$object;
			},
			stations: function (orgcode) {
				return nhHttp.get('', 'scripts/api/station:orgId.json', {orgId: orgcode}, true);
			},
			delivers: function (station) {
				return nhHttp.get('', 'scripts/api/deliver.json', null, true);
			}
		}
	}

})();