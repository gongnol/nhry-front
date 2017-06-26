(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('PiInterfaceCtrl', PiInterfaceCtrl)
        .controller('VipcustModalCtrl', VipcustModalCtrl)
        .controller('CreateDayplanModalCtrl', CreateDayplanModalCtrl);

    PiInterfaceCtrl.$inject = ['$alert','$scope', '$state','restService', '$uibModal'];

    function PiInterfaceCtrl($alert,$scope, $state, rest, $uibModal) {

        var vm = $scope;
        //同步产品主数据
        vm.getProducts =function(){
        	//console.log('getProducts');
        	rest.getProducts().then(function(json){
				if (json.type == 'success') {
						var alert = $alert({
							content: '同步产品主数据成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}
				}, function(reject) {
					var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				});  
        }
        //同步产品主数据(学生奶)
        vm.getStudProducts =function(){
        	rest.getStudProducts().then(function(json){
				if (json.type == 'success') {
						var alert = $alert({
							content: '同步产品主数据（学生奶）成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}
				}, function(reject) {
					var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				});  
        }
        //同步奶站经销商数据
        vm.getCustomer = function(){
         	//console.log('getCustomer');
        	rest.getCustomer().then(function(json){
				if (json.type == 'success') {
						var alert = $alert({
							content: '同步奶站经销商数据成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}
				}, function(reject) {
					var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				});     	
        }
        //同步学生奶数据
        vm.getStudCustomer = function(){
        	rest.getStudCustomer().then(function(json){
				if (json.type == 'success') {
						var alert = $alert({
							content: '数据同步成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}
				}, function(reject) {
					var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				});     	
        }
        // 同步字典数据
        vm.getZD =function(){
          	//console.log('getZD');
        	rest.getZD().then(function(json){
				if (json.type == 'success') {
						var alert = $alert({
							content: '同步字典数据成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}
				}, function(reject) {
					var alert = $alert({
						content: reject.data.msg,
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				});          	
        }
        // 同步订户会员信息
        vm.getVipcust = function () {
        	var modalInst = $uibModal.open({
                templateUrl: 'vipcustModal.html',
                controller: 'VipcustModalCtrl',
                controllerAs: 'vcm'
            });
        }
        // 订单生成日计划
        vm.createDayplan = function () {
        	var modalInst = $uibModal.open({
                templateUrl: 'createDayplanModal.html',
                controller: 'CreateDayplanModalCtrl',
                controllerAs: 'dpm'
            });
        }
        // 同步IDM账户
        vm.synIDMUser =function(){
          	//console.log('getZD');
        	rest.syncIDMUser().then(function(json){
				if (json.data) {
					var alert = $alert({
						content: '同步IDM账户成功!',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				} else {
					var alert = $alert({
						content: '同步IDM账户失败!',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					})
				}
			}, function(reject) {
				var alert = $alert({
					content: reject.data.msg,
					container: '#modal-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
			});          	
        }
    }

    VipcustModalCtrl.$inject = ['$alert', '$uibModalInstance', 'restService'];

    function VipcustModalCtrl($alert, $uibModalInstance, rest) {
    	var vm = this;
    	vm.cancelModal = cancelModal;
    	vm.synVipcust = synVipcust;
    	//获取全部销售组织
        rest.messageTypes('1002').then(function (json) {
           vm.salesOrgs = json.data;
        });

        function synVipcust() {
        	if (!vm.salesOrg) {
        		var alert = $alert({
                    content: '请选择销售组织！',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
        	} else {
        		rest.batchAddVipSapNo(vm.salesOrg).then(function (resp) {
        			if (resp.type == 'success') {
	                    var alert = $alert({
	                        content: '同步成功!',
	                        container: '#modal-alert'
	                    })
	                    alert.$promise.then(function () {
	                        alert.show();
	                    }).then(function () {
	                        closeModal();
	                    })
	                }
        		}, function (reject) {
        			var errAlert = $alert({
	                    content: reject.data.msg,
	                    container: '#modal-alert'
	                })
	                errAlert.$promise.then(function () {
	                    errAlert.show();
	                })
        		})
        	}
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }

    CreateDayplanModalCtrl.$inject = ['$alert', '$uibModalInstance', 'restService'];

    function CreateDayplanModalCtrl($alert, $uibModalInstance, rest) {
    	var vm = this;
    	vm.cancelModal = cancelModal;
    	vm.comfirmed = comfirmed;

        function comfirmed() {
        	if (vm.orderNo.length < 5) {
        		var alert = $alert({
                    content: '订单编号请至少输入五位字符！',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
        	} else {
        		rest.createDaliyPlansForIniOrders(vm.orderNo);
        		var alert = $alert({
                    content: '日计划生成中!',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                }).then(function () {
                    closeModal();
                })
        	}
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }

})();