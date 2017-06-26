/**
 * @ngdoc Controller
 * @name nh_addUser
 *
 * 订户信息录入控制器
 */
(function() {
	'use strict';
	
	angular
		.module('newhope')
		.controller('AddOneCsmCtrl', AddOneCsmCtrl);

	AddOneCsmCtrl.$inject = ['$scope', '$sessionStorage', '$state', '$stateParams', '$alert', 'restService'];

	function AddOneCsmCtrl($scope, $sessionStorage, $state, $stateParams, $alert, rest) {
		var userDealerID = $sessionStorage.user.dealerId;
		var userBranchNo = $sessionStorage.user.branchNo;
		var vm = this;

		vm.user = {};
		vm.user.mp = $stateParams.mp;
		vm.user.vipMp = $stateParams.mp;
		vm.saveInfoForm = false;
		vm.user.vipType = '20';

		// 如果有机构ID字段，则属于机构创建订户
		if ($stateParams.orgId) {
			vm.user.orgId = $stateParams.orgId
		}

		vm.checkVipMp = checkVipMp;

		rest.codeMap('1006').then(function (json) {
			vm.vipSrcs = json.data;
		})

		if (!userBranchNo) {
			if (!userDealerID) {
				rest.priceDealers().then(function (json) {
					vm.dealers = json.data;
				})
			} else {
				vm.hasDealer = true;
				vm.user.dealerName = $sessionStorage.user.dealerName;
				vm.user.dealerNo = userDealerID;
				rest.getBranchByDealer(userDealerID).then(function (json) {
					vm.branchs = json.data;
				})
			}
		} else {
			vm.hasDealer = true;
			vm.hasbranch = true;
			vm.user.branchName = $sessionStorage.user.branchName;
			vm.user.branchNo = userBranchNo;
			if (!userDealerID) {
				vm.user.dealerName = '自营奶站';
				vm.user.dealerNo = '-1';
			} else {
				vm.user.dealerName = $sessionStorage.user.dealerName;
				vm.user.dealerNo = userDealerID;
			}
			rest.getAreaByBranchNo(userBranchNo).then(function (json) {
				vm.subdist = json.data;
			})
		}

		vm.checkVipMp();

		$scope.$watch('data.user.vipMp', function () {
			vm.vipCheckMsg = '';
		})

		vm.saveInfo = function () {
			//console.log(vm.user);
			vm.saveInfoForm = true;
			vm.user.province = $scope.selectAddr[0].itemCode;
			vm.user.city = $scope.selectAddr[1].itemCode;
			vm.user.county = $scope.selectAddr[2].itemCode;
			rest.addCsmItem(vm.user).then(function (json) {
				if(json.type == 'success'){
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#body-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                    vm.saveInfoForm = false;
                }
			}, function (reject) {
				//console.log(reject);
				var alert = $alert({
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                vm.saveInfoForm = false;
			})
		}

		vm.saveCreate = function () {
			vm.saveInfoForm = true;
			vm.user.province = $scope.selectAddr[0].itemCode;
			vm.user.city = $scope.selectAddr[1].itemCode;
			vm.user.county = $scope.selectAddr[2].itemCode;
			rest.addCsmItem(vm.user).then(function (json) {
				if(json.type == 'success'){
                    $state.go('newhope.orderCreate', {
                    	selectCust: true, 
                    	vipCustNo: json.data, 
                    	vipCustName: vm.user.vipName, 
                    	vipCustTel: vm.user.mp, 
                    	branchNo: vm.user.branchNo, 
                    	branchName: vm.user.branchName,
                    	vipType: vm.user.vipType,
                    	orgId: $stateParams.orgId || null
                    });
                }
			}, function (reject) {
				//console.log(reject);
				var alert = $alert({
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                vm.saveInfoForm = false;
			})
		}

		vm.dealerSelected = function (dealerNo) {
			vm.user.branchNo = '';
			rest.getBranchByDealer(dealerNo.dealerNo).then(function (json) {
				vm.branchs = json.data;
			})
		}

		vm.areaSelected = function (areaObj) {
			$scope.selectAddr = [];
			vm.areaLabel = '';
			if (areaObj) {
				$scope.selectAddr[0] = {
					itemCode: areaObj.province,
					itemName: areaObj.provinceName
				};
				$scope.selectAddr[1] = {
					itemCode: areaObj.city,
					itemName: areaObj.cityName
				};
				$scope.selectAddr[2] = {
					itemCode: areaObj.county,
					itemName: areaObj.countyName
				};
				vm.areaLabel = areaObj.addressTxt + areaObj.residentialAreaTxt;
			}
			vm.getFullAddress();
		}

		vm.branchSelected = function (branchObj) {
			if (vm.user.subdist) {
				vm.user.subdist = '';
				vm.areaLabel = '';
			}
			vm.subdist = [];
			$scope.selectAddr = [];

			rest.getAreaByBranchNo(branchObj.branchNo).then(function (json) {
				vm.subdist = json.data;
			})
		}

		vm.getArea = function (addr) {
			//console.log(addr);
			var params = {
				province: addr[0].itemCode,
  				city: addr[1].itemCode,
  				county: addr[2].itemCode
			}
			rest.searchAreaBySalesOrg(params).then(function (json) {
				if (vm.user.subdist) {
					vm.user.subdist = '';
					vm.areaLabel = '';
				}
				vm.subdist = json.data;
			})
		}

		vm.getFullAddress = function () {
			var str = '';
			if ($scope.selectAddr && $scope.selectAddr.length == 3) {
				str += $scope.selectAddr[0].itemName || '';
				str += $scope.selectAddr[1].itemName || '';
				str += $scope.selectAddr[2].itemName || '';
			}
			
			str += vm.areaLabel || '';
			str += vm.user.addressTxt || '';
			// return str;
			vm.fullAddressText = str;
		}

		function checkVipMp() {
			//console.log(vm.user.vipMp);
			if (vm.user.vipMp) {
				rest.isVip(vm.user.vipMp).then(function (resp) {
					if (resp.type == 'success') {
						if (resp.data) {
							vm.vipCheckMsg = '会员已存在，新建订户将关联到该会员！';
						} else {
							vm.vipCheckMsg = '会员不存在，新建订户将同时新建会员！';
						}
					}
				})
			}
		}
	}
})();