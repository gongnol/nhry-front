/**
 * @ngdoc overview
 * @name appCtrl
 *
 * 应用主模块控制器，定义全局变量
 */
(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('AppCtrl', AppCtrl);

	AppCtrl.$inject = ['$scope', '$location'];

	function AppCtrl($scope, $location) {
		$scope.app = {
			preUrl: 'http://' + window.location.host + '/master/api/v1',	// 远程请求前缀
			//preUrl: 'http://' + window.location.host + '/d/NhryService/api/v1',	// 远程请求前缀
			setting: {
				bg: '',
				boxed: false
			}
		};
		$scope.setFolded = setFolded;
		function setFolded(){
			//console.log(1)
			$scope.app.setting.folded = !$scope.app.setting.folded;
		}
		// 全局angular-datatables配置选项
		$scope.dtOpSetting = {
			language: {
				"sEmptyTable": "没有有效数据",
				"sInfo": "显示第 _START_ 到第 _END_ 条记录/共 _TOTAL_ 条记录",
				"sLengthMenu": "每页显示 _MENU_ 条记录",
				"sInfoEmpty": "没有数据",
				"sInfoFiltered": "(从 _MAX_ 条数据中检索)",
				"sInfoPostFix": "",
				"sInfoThousands": ",",
				"sLoadingRecords": "加载中...",
				"sProcessing": "处理中...",
				"sSearch": "搜索: ",
				"sZeroRecords": "抱歉，没有找到",
				"oPaginate": {
					"sFirst": "首页",
					"sLast": "尾页",
					"sNext": "»",
					"sPrevious": "«"
				}
			}
		};

	}
})();