/**
 * @ngdoc Controller
 * @name nh_addUser
 *
 * 已有订户信息显示控制器
 */
(function() {
	'use strict';
	
	angular
		.module('newhope')
		.controller('AddCsmExitCtrl', AddCsmExitCtrl);

	AddCsmExitCtrl.$inject = ['$scope', '$timeout', '$state', '$stateParams', '$alert', 'restService'];

	function AddCsmExitCtrl($scope, $timeout, $state, $stateParams, $alert, rest) {
		var vm = this;
		vm.toggle1 = true;
		vm.toggle2 = true;
		vm.toggle3 = true;
		vm.addrs = [];
		vm.defaultAddr = {};

		var tmpUser = $stateParams.user;
		tmpUser.birthday = tmpUser.birthday ? tmpUser.birthday.toString().substring(0, 10) : '';
		tmpUser.genderLabel = tmpUser.sex == '0' ? '女士' : tmpUser.sex == '1' ? '先生' : '';

		var getStr = function (str) {
			return str ? str : '';
		};

		vm.user = tmpUser;

		rest.getCustomerRemainAmt($stateParams.user.vipCustNo).then(function (json) {
			vm.csmAcctAmt = json.data.acctAmt || 0;
		})

		rest.getCustomerAddresses($stateParams.user.vipCustNo).then(function (json) {
			if (json.type == 'success') {
				json.data.forEach(function (ele) {
					var detail = getStr(ele.provinceName) + getStr(ele.cityName) + getStr(ele.countyName) + getStr(ele.residentialAreaName) + getStr(ele.addressTxt);
					if (ele.isDafault == 'Y') {
						vm.defaultAddr.detail = detail;
						vm.defaultAddr.phone = ele.mp;
					} else {
						vm.addrs.push({
							detail: detail,
							phone: ele.mp
						})
					}
				})
			}
		})
	}
})();