/** 数据表内复选框指令
 *  实现单选、多选和全选/全不选功能
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('nhCheckbox', function() {
			return {
				restrict: 'A',
				scope: {
					checkedDatas: '='
				},
				link: function($scope, iElm, iAttrs, controller) {
					var allChecked = 'thead :checkbox';
					var oneChecked = 'tbody :checkbox';

					// checked数组用于记录该页选中的行，值为复选框的data-row属性
					var checked = [];
					// $scope.dt = {};

					// 表头的全选框
					iElm.on('change', allChecked, function() {
						var flag = $(this).prop('checked');
						var chelms = iElm.find(oneChecked);
						checked = [];
						chelms.each(function(idx, ele) {
							$(ele).prop('checked', flag);
							if (flag) {
								checked.push(ele.attributes["checked-data"].value);
							}
						})
						// if (!flag) {
						// 	checked = [];
						// }
						$scope.checkedDatas = checked;
						$scope.$apply();
					})

					// 表内每行的复选框
					iElm.on('change', oneChecked, function() {
						var isChecked = true;
						var flag = $(this).prop('checked');
						var curData = this.attributes["checked-data"].value;
						var allChelms = iElm.find(allChecked);
						var chelms = iElm.find(oneChecked);
						checked = $scope.checkedDatas;
						if (flag) {
							checked.push(curData);
							chelms.each(function(idx, ele) {
								if (!$(ele).prop('checked')) {
									isChecked = false;
									return false;
								}
							})
						}else {
							checked.forEach(function (ele, index, arr) {
								if (ele === curData) {
									arr.splice(index, 1);
									return false;
								}
							})
						}
						// 根据每一个复选框的状态设置全选框状态
						allChelms.prop('checked', flag && isChecked);

						$scope.checkedDatas = checked;
						$scope.$apply();
					})

					$scope.$on('clearAllChecks', function () {
						var chelms = iElm.find(oneChecked);
						chelms.each(function(idx, ele) {
							$(ele).prop('checked', false);
						})
					})
				}
			};
		});
})();