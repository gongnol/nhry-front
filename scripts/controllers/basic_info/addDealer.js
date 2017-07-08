
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('AddDealerCtrl', AddDealerCtrl);

	AddDealerCtrl.$inject = ['$scope', '$stateParams', '$alert', '$uibModal', '$state', 'restService'];
	function AddDealerCtrl($scope, $stateParams, $alert, $uibModal, $state, rest) {
		var pvm = this;
		 var vm = $scope;
		 vm.info = {};
		 vm.dealer = {};
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
		vm.addDealer = function(){
			if(confirm("确定增加?")){
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
				if (typeof(vm.atmselectAdd) === 'undefined' || vm.atmselectAdd.length < 3) {
	        		var alert = $alert({
						content: '请选择完整的省市区信息！',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
					return ;
        		}


        		if (typeof(vm.dealer.dealerNo) === 'undefined' || typeof(vm.dealer.dealerName) === 'undefined') {
	        		var alert = $alert({
						content: '经销商编号和名称不能为空！',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
					return;
        		}
				vm.dealer.province = vm.atmselectAdd[0].itemCode;
				vm.dealer.city = vm.atmselectAdd[1].itemCode;
				vm.dealer.county = vm.atmselectAdd[2].itemCode;
				vm.dealer.delFlag = 'Y';
				rest.addDealer(vm.dealer).then(function (json) {
					 if (json.type === 'success') {
        				var alert = $alert({
							content: '经销商添加成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})

						vm.returnBack();
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
			}else{
				alert("取消");
				return ;
			}
		}
	}
		
})();