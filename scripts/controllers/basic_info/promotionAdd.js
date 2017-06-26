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
		.controller('PromotionAddCtrl', PromotionAddCtrl);

	PromotionAddCtrl.$inject = ['$scope', '$timeout', '$state', '$stateParams', '$alert', 'restService'];

	function PromotionAddCtrl($scope, $timeout, $state, $stateParams, $alert, rest) {
		//var saveAlert = $alert({content: '保存成功！'});
			var pvm = this;
			var vm = $scope;
			vm.promotion = $stateParams.promSubType;
			vm.promOrig = [];
			vm.prom = {"promSubType":vm.promotion,"items":vm.promOrig};
			
	        /*产品列表*/
	        rest.getProductByCodeOrName("").then(function(json){
	          vm.Rproducts = json.data;   
	        })

			vm.returnBack = function (){
				$state.go('newhope.promotionlist');
			}

			vm.addItem = function(){
				var item = vm.promOrig.length + 1;
				var orig = {itemNo:item*10};
				vm.promOrig.push(orig);
			}

			vm.delItem = function(itemNo,idx){
				vm.promOrig.splice(idx, 1);
			}

			vm.addPromotion = function(){
				var errMsg = "";
			   if(vm.prom.length<=0){
			   		errMsg = "促销行不能没有";
			   }
			   if(vm.prom.planStartTime == null ||
				  vm.prom.planStopTime == null ||
				  vm.prom.buyStartTime == null ||
				  vm.prom.buyEndTime == null
			   ){
			   		errMsg = "下单日期范围和配送日期范围不能为空";
			   }
			   if(errMsg!==""){
			   		 var saveAlert = $alert({
	                        content: 'errMsg!!',
	                        container: '#modal-alert'
	                    })
	                    saveAlert.$promise.then(function () {
	                        saveAlert.show();
	                    })
			   }

				rest.addPromotion(vm.prom).then(function(json){
		            var result = json.type;
		            if(result == 'success'){
		                var saveAlert = $alert({
	                        content: '保存成功！',
	                        container: '#modal-alert'
	                    })
	                    saveAlert.$promise.then(function () {
	                        saveAlert.show();
	                    })
		            }
		        }, function(json){
	                var saveAlert = $alert({
	                    content: '保存失败！'+ json.data.msg,
	                    container: '#modal-alert'
	                })
	                saveAlert.$promise.then(function () {
	                    saveAlert.show();
	                })
	            });

			}

	}
})();