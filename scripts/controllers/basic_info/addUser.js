
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('AddUserCtrl', AddUserCtrl);
	AddUserCtrl.$inject = ['$scope', '$alert', '$uibModal', '$state', 'restService'];
	function AddUserCtrl($scope, $alert, $uibModal, $state, rest) {
		var pvm = this
		 var vm = $scope;
		 vm.info = {};
		 vm.users = {};

		
       	//公司
		rest.codeMap('1003').then(function (json) {
			vm.companys =  json.data;
		})


		vm.returnBack = function (){
			$state.go('newhope.userinfo');
		}

		vm.addUser = function(){
			if(confirm("确定增加?")){
				//
				rest.addUser(vm.users).then(function (json) {
					 if (json.type === 'success') {
        				var alert = $alert({
							content: '用户添加成功!',
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