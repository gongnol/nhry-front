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
			pageData: function (pageno) {
				if (pageno == 2) {
					return rest.one('datatable6.json').get();
				}
				return rest.one('consumerList.json').get();
			},
			//查询产品信息列表
			getPDList: function(pageno){
				return rest.one('productList.json').get();
			},

			//查询奶站结算信息列表
			getMSBList: function(pageno){
				return rest.one('milkstationBill.json').get();
			},
			//送奶工查询信息列表
			getEBList: function(pageno){
				return rest.one('consumerBill.json').get();
			},
			//订户信息列表
			getCBList: function(pageno){
				return rest.one('consumerBill.json').get();
			},
			//回瓶管理列表
			getReturnBoxList: function(pageno){
				return rest.one('returnboxBill.json').get();
			},
			getRouteList:function(pageno){
				return rest. one('routelist.json').get();
			},
			getMilkBoxList: function(pageno){
				return rest.one('mbList.json').get();
			},
			//人工分单
			getManhandleList: function(pageno){
				return rest.one('cancelList.json').get();
			},
			//待确认订单
			getRequiredOrderList: function(pageno){
				return rest.one('datatable5.json').get();
			}
		}
	}

})();