/** 地址联动选择指令
 *  实现省份、城市和区域联动选择功能
 *
 */
(function () {
	'use strict';
	angular
		.module('newhope')
		.directive('nhAddressSelect', ['$compile', '$parse', 'nhAddressConf', nhAddressDirective])
		.provider('nhAddressConf', nhAddressConfProvider);

	function nhAddressDirective($compile, $parse, nhAddressConf) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				placeholder: '@',
				addrSelected: '=',
				addrCallback: '&',
				addrClearfun: '&'
			},
			templateUrl: function (ele, attrs) {
				return attrs.tplUrl || nhAddressConf.getTplPath;
			},
			controller: ['$scope', '$element', '$attrs', 'restService', nhAddressDirectiveCtrl],
			link: nhAddressDirectiveLink
		}

		function nhAddressDirectiveCtrl(scope, ele, attrs, rest) {
			// 直辖市，特区，海外等做特殊处理
			var speCity = ['11', '12', '31', '50'];

			// 保存省、市、区县和街道的可选择数据
			scope.selctions = [];
			
			// 初始请求所有省份
			rest.address('-1').then(function (json) {
				scope.selctions.push(json.data);
			})
			// 保存每个tab的标题
			scope.panes = [{
				title: '省份'
			}, {
				title: '城市'
			}, {
				title: '区县'
			}];
			// 标识地址选择控件是否可见
			scope.isVisible = false;
			// 标识当前激活tab，初始化时为城市
			scope.activeIdx = 0;
			// 地址选择控件是否可选
			scope.disFlag = typeof(attrs.addrDisabled) == 'undefined' ? false : true;
			
			scope.toggle = function () {
				scope.isVisible = !scope.isVisible;
			};

			scope.setActive = function (paneIdx) {
				scope.activeIdx = paneIdx;
			};
			
			scope.setAddr = function (evt, index, obj) {
				var newSelected = [];
				// 清除当前tab及之后tab所选择的数据
				if (scope.addrSelected) {
					newSelected = scope.addrSelected.slice(0, index);
				}

				// 如果在省份tab里选择speCity范围内的城市，则省份和城市相同，选择后直接跳至区县tab
				// if (index == 0 && speCity.indexOf(obj.itemCode) != -1) {
				// 	scope.selctions[1] = [obj];
				// 	rest.address(obj.itemCode).then(function (json) {
				// 		scope.selctions[2] = json.data;
				// 		scope.setActive(2);
				// 	})
				// 	newSelected[0] = obj;
				// 	newSelected[1] = angular.copy(obj);
				// 	newSelected[1].itemName = '';
				// } else {
				// 	newSelected[index] = obj;
				// 	if (index < scope.panes.length-1) {
				// 		rest.address(obj.itemCode).then(function (json) {
				// 			scope.selctions[index+1] = json.data;
				// 			scope.setActive(index+1);
				// 		})
				// 	} else {
				// 		scope.toggle();
				// 		ele.find('.addr-select-box').removeClass('active');
				// 	}
				// }
				newSelected[index] = angular.copy(obj);
				if (index < scope.panes.length-1) {
					
					rest.address(obj.itemCode).then(function (json) {
						scope.selctions[index+1] = json.data;
						scope.setActive(index+1);
					})
					if (index == 1 && speCity.indexOf(obj.parent) != -1) {
						newSelected[index].itemName = '';
					}
				} else {
					scope.toggle();
					ele.find('.addr-select-box').removeClass('active');
				}

				scope.addrSelected = newSelected;

				if (index == scope.panes.length-1) {
					scope.addrCallback({addr: scope.addrSelected});
				}
				
			}
			// 根据文字长度计算每个选择按钮的宽度
			scope.itemWidth = function (itemName) {
				var len = itemName.length;
				var level = Math.round(len/4)+1;
				// var level = Math.ceil(len/2)+1;
				return 'col-md-' + level;
			}

			scope.addrEmpty = function () {
				return !scope.addrSelected || scope.addrSelected.length == 0;
			}
			// 清除已选地址数据
			scope.clearAddr = function (evt) {
				scope.addrSelected = [];
				scope.setActive(0);
				scope.addrClearfun();
				evt.stopPropagation();
			}
		}

		function nhAddressDirectiveLink(scope, ele, attrs) {
			
			ele.find('.addr-selected').on('click', function (e) {
				if (!scope.disFlag) {
					toggleSelectBox();
				}
				e.stopPropagation();
			})

	        angular.element(document).on('click', onDocumentClick);

	        scope.$on('$destroy', function () {
	        	angular.element(document).off('click', onDocumentClick);
	        });

	        function onDocumentClick(e) {
	        	if (!scope.isVisible) return;

		        if (!ele[0].contains(e.target)) {
		        	toggleSelectBox();
		        }
	        }

	        function toggleSelectBox() {
	        	scope.toggle();
	        	if (scope.isVisible) {
	        		ele.find('.addr-select-box').addClass('active');
	        	} else {
	        		ele.find('.addr-select-box').removeClass('active');
	        	}
	        }
		}
	}

	function nhAddressConfProvider() {
		var tplPath = 'nhtpl/address.tpl.html';

		this.setTplPath = function (path) {
			tplPath = path;
		}

		this.$get = function () {
			return {
				getTplPath: tplPath
			}
		}
	}
})();