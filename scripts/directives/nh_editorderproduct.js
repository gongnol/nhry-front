/** 
 *  点击禁用
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('editorderproductDirective', ['restService', '$alert', function(restService,$alert) {
					return {
						restrict: 'A',
						link: function($scope, iElm, iAttrs, controller) {
							iElm.on('click', function() {
								var product = {};
						    	product.matnr = $.trim(iElm.parents('#productRow').find('#productId').text());
						    	product.matnrTxt = $.trim(iElm.parents('#productRow').find('#productName').text());
						    	product.shortTxt = $.trim(iElm.parents('#productRow').find('#productShortName').text());
						    	product.qty = iElm.parents('#productRow').find('#productCount').val();
						    	product.unit = iAttrs.bottype;
						    	if(product.qty == undefined || $.trim(product.qty) == "" ){
							    		var saveAlert = $alert({
					                        content: '请选择数量！',
					                        container: '#body-alert'
					                    })
					                    saveAlert.$promise.then(function () {
					                        saveAlert.show();
					                    })
							    		return;
							    }
							    /*获取商品价格*/
							    if($scope.orderDetail.order.preorderSource=='70'){
									if($scope.isold =='N') {
										if($scope.user.priceAgree!=undefined){
											product.salesPrice = $scope.user.priceAgree;
											product.priceDeliver = $scope.user.priceDeliver;
											product.priceHome = $scope.user.priceHome;
											product.priceNetValue = $scope.user.priceNetValue;
											$scope.replaceProduct.product = product;
											$scope.$apply();
										}else{
											alert('商品价格存在问题，请维护')
										}
									} else {
										if ($scope.user.oldPrice == undefined) {
											alert('商品价格存在问题，请维护')
										} else {
											product.salesPrice = $scope.user.oldPrice;
											product.priceDeliver = $scope.user.oldPriceDeliver;
											product.priceHome = $scope.user.oldPriceHome;
											product.priceNetValue = $scope.user.oldPriceNetValue;
											$scope.replaceProduct.product = product;
											$scope.$apply();
										}
									}
							    }else{
								    restService.getProductPrice($scope.order.branchNo,product.matnr,$scope.order.deliveryType).then(function (json) {
										product.salesPrice = json.data;
									},function(){
										alert("获取商品价格失败!");
									}).then(function(){
										// alert(JSON.stringify(product));
										$scope.replaceProduct.product = product;
										// $scope.$apply();//刷新
									})	
							    }
						    	
							});
						}
					};
				}]);
})();