/**
 * @ngdoc Service
 * @name nh_tableService
 *
 * 数据表服务
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.factory('tableService', tableService);

	tableService.$inject = ['$compile', 'DTOptionsBuilder', 'DTColumnBuilder'];

	function tableService($compile, DTOptionsBuilder, DTColumnBuilder) {

		return {
			dtOps: function(scope, url, params) {
				var ops = DTOptionsBuilder.newOptions()
					.withOption('ajax', { // 使用ajax方式获取数据源
						url: scope.app.preUrl + url,
						type: 'POST',
						contentType: "application/json",
						data: function(d) {
							var ajaxParams = {};
							if (params && typeof(params) == 'object') {
								for (var param in params) {
									if (param != 'pageSize' && param != 'pageNum') {
										ajaxParams[param] = params[param];
									}
								}
							}
							ajaxParams.pageSize = d.length;
							ajaxParams.pageNum = Math.floor(d.start / d.length) + 1;
							return JSON.stringify(ajaxParams); // JSON字符串序列化处理
						}
					})
					.withDataProp(function(json) { // 设置sAjaxDataProp属性，把从服务端获取的数据交由datatables处理前进行定制化
						//console.log(json);
						json.recordsTotal = json.data.total; // 过滤器的总记录数_MAX_
						json.recordsFiltered = json.data.total; // 过滤后的总记录数_TOTAL_
						return json.data.list;
					})
					.withOption('processing', true)
					.withOption('serverSide', true)
					.withPaginationType('full_numbers')
					.withLanguage(scope.dtOpSetting.language)
					.withOption('createdRow', createdRow)
					.withOption('headerCallback', headerCallback)
					.withOption('rowCallback', rowCallback)
					.withOption('searching', false);

				function createdRow(row, data, dataIndex) {
					$compile(angular.element(row).contents())(scope);
				}

				function rowCallback(row, data, dataIndex) {
					angular.element(row).find(':checkbox').prop('checked', false);
				}

				function headerCallback(header) {
					angular.element(header).find(':checkbox').prop('checked', false);
					if (!scope.headerCompiled) {
						scope.headerCompiled = true;

						$compile(angular.element(header).contents())(scope);
					}
				}

				return ops;
			},
			dtCol: function(data, title) {
				return DTColumnBuilder.newColumn(data).withTitle(title);
			},
			dtLocalOps: function(scope, url, params) {
				var ops = DTOptionsBuilder
					.fromSource(url)
					.withPaginationType('full_numbers')
					.withLanguage(scope.dtOpSetting.language)
					.withOption('createdRow', createdRow)
					.withOption('headerCallback', headerCallback)
					.withOption('rowCallback', rowCallback)
					.withOption('searching', false);

				function createdRow(row, data, dataIndex) {
					$compile(angular.element(row).contents())(scope);
				}

				function rowCallback(row, data, dataIndex) {
					angular.element(row).find(':checkbox').prop('checked', false);
				}

				function headerCallback(header) {
					angular.element(header).find(':checkbox').prop('checked', false);
					if (!scope.headerCompiled) {
						scope.headerCompiled = true;

						$compile(angular.element(header).contents())(scope);
					}
				}

				return ops;
			},
			dtNewOps: DTOptionsBuilder.newOptions()
		}
	}

})();