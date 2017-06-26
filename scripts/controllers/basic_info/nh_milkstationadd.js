
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('MilkInfoAddCtrl', MilkInfoAddCtrl);

	MilkInfoAddCtrl.$inject = ['$scope', '$stateParams', '$alert', '$uibModal', '$state', 'restService'];
	function MilkInfoAddCtrl($scope, $stateParams, $alert, $uibModal, $state, rest) {

		var pvm = this;

		 var vm = $scope;
		 vm.info = {};
		 vm.nhmilk = {};

		 vm.branchGroup =[
                {"code": "01","label": "自营奶站"},
                {"code": "02","label": "经销商奶站"}
       		 ];
       	//公司
		rest.codeMap('1003').then(function (json) {
			vm.companys =  json.data;
		})


		rest.codeMap('1005').then(function (json) {
			vm.allwerks =  json.data;
		})

		//仓库
		rest.codeMap('1011').then(function (json) {
			vm.lgorts =  json.data;
		})



		rest.codeMap('2012').then(function (json) {
			vm.isValids =  json.data;
		})



		vm.returnBack = function (){
			$state.go('newhope.milkstationlist');
		}



		vm.addBranch = function(){

			if(confirm("确定增加?")){
				///不能全
				if(vm.nhmilk === undefined ) {
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
        		}
				vm.nhmilk.province = vm.atmselectAdd[0].itemCode;
				vm.nhmilk.city = vm.atmselectAdd[1].itemCode;
				vm.nhmilk.county = vm.atmselectAdd[2].itemCode;

				rest.addBranch(vm.nhmilk).then(function (json) {
					 if (json.type === 'success') {
        				var alert = $alert({
							content: '奶站账户添加成功!',
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
			}else{
				alert("取消");
				return ;
			}
		}
	}
		
})();