
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('UptDealerCtrl', UptDealerCtrl);

	UptDealerCtrl.$inject = ['$scope', '$stateParams', '$alert', '$uibModal', '$state', 'restService'];
	function UptDealerCtrl($scope, $stateParams, $alert, $uibModal, $state, rest) {
		var pvm = this;
		 var vm = $scope;
		 vm.info = {};

		 vm.dealerNo = $stateParams.dealerNo;

		 rest.getDealerInfo(vm.dealerNo).then(function (json) {
			vm.dealer =  json.data;
			vm.udatmselectupt = [];
			vm.udatmselectupt[0] = {
				itemCode: vm.dealer.province,
				itemName: vm.dealer.provinceName
			}
			vm.udatmselectupt[1] = {
				itemCode: vm.dealer.city,
				itemName: vm.dealer.cityName
			}
					vm.udatmselectupt[2] = {
				itemCode: vm.dealer.county,
				itemName: vm.dealer.countyName
			}
		})
       	//公司
		rest.codeMap('1003').then(function (json) {
			vm.companys =  json.data;
		})


		//状态
		rest.codeMap('2014').then(function (json) {
			vm.status =  json.data;
		})
	
		vm.returnBack = function (){
			$state.go('newhope.dealerlist');
		}
		vm.uptDealer = function(){
			if(confirm("确定修改?")){
				///不能全
				if(vm.dealer === undefined ) {
					var alert = $alert({
						content: '信息不能为空！',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				}
				if (typeof(vm.udatmselectupt) === 'undefined' || vm.udatmselectupt.length < 3) {
	        		var alert = $alert({
						content: '请选择完整的省市区信息！',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
					return;
        		}
				vm.dealer.province =  vm.udatmselectupt[0].itemCode;
				vm.dealer.city =   vm.udatmselectupt[1].itemCode;
				vm.dealer.county = vm.udatmselectupt[2].itemCode;
				vm.dealer.delFlag = 'Y';
				rest.updateDealerInfo(vm.dealer).then(function (json) {
					 if (json.type === 'success') {
        				var alert = $alert({
							content: '经销商修改成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
        			}
        			
        		
        		}, function (reject) {
        			var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
					
				})
			}
		}
	}
		
})();