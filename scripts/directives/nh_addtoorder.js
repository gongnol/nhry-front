/** 
 *  点击禁用
 *
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.directive('addtoorderDirective', ['restService', '$alert', function(restService,$alert) {
					return {
						restrict: 'A',
						link: function($scope, iElm, iAttrs, controller) {
							iElm.on('click', function() {
								var product = {};
								if($scope.order.paymentStat == '20')product.dispTotal = 30;//默认30个一组
								if ($scope.promData && $scope.promData.promIdx) {
									var tmpProm = $scope.promData.promTypes[$scope.promData.promIdx];
									if (tmpProm) {
										switch(tmpProm.yearType) {
											case 'YEAR-CARD':
												product.dispTotal = 365;
												break;
											case 'HALF-YEAR-CARD':
												product.dispTotal = 180;
												break;
											case 'QUARTER-CARD':
												product.dispTotal = 90;
												break;
										}
									}
								}
						    	product.matnr = $.trim(iElm.parents('#productRow').find('#productId').text());
						    	product.matnrTxt = $.trim(iElm.parents('#productRow').find('#productName').text());
						    	product.reachTimeType = '10';
						    	product.unit = iAttrs.bottype;
						    	product.gapDays = 0;
						    	product.qty = iElm.parents('#productRow').find('#productCount').val();
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
							    if ($scope.promData && $scope.promData.promIdx) {
							    	restService.getMatnrYearcardPrice(product.matnr).then(function (json) {
										if(json.type!="success"){
											alert("获取商品价格失败!");
										}
										if(json.data.priceAgree!=undefined){
											product.salesPrice = json.data.priceAgree;
											product.orgPriceDeliver = json.data.priceDeliver;
										}else{
											alert("商品价格没有维护，请检查!");
											return;
										}
									}).then(function(){
										if(product.salesPrice <= 0 ){
											alert("商品价格存在问题，请维护!");
											return;
										}
								    	product.rowNum = $scope.addId.rowNum;
										$scope.addId.rowNum = $scope.addId.rowNum + 2;
								    	// alert(JSON.stringify($scope.entries));
								    	console.log(product);
								    	$scope.entries.push(product);
								    	// $scope.$apply();//刷新
									})
							    }else if($scope.order.preorderSource=='70'){
							    	console.log($scope.order)
							    	 var proParams = {
							    	 	orgId:$scope.order.onlineSourceType,
							    	 	matnr:product.matnr
							    	 }
							    	 restService.selectOrgPriceByMatnr(proParams).then(function (json) {
										if(json.type!="success"){
											alert("获取商品价格失败!");
										}
										if(json.data.priceAgree!=undefined){
											product.salesPrice = json.data.priceAgree;
											product.orgPriceDeliver = json.data.priceDeliver;
										}else{
											alert("商品价格没有维护，请检查!");
											return;
										}
										
									}).then(function(){
										if(product.salesPrice <= 0 ){
											alert("商品价格存在问题，请维护!");
											return;
										}
								    	product.rowNum = $scope.addId.rowNum;
										$scope.addId.rowNum = $scope.addId.rowNum + 2;
								    	// alert(JSON.stringify($scope.entries));
								    	$scope.entries.push(product);
								    	// $scope.$apply();//刷新
									})
							    }else{
							    	restService.getProductPrice($scope.order.branchNo,product.matnr,$scope.order.deliveryType).then(function (json) {
										if(json.type!="success"){
											alert("获取商品价格失败!");
										}
										product.salesPrice = json.data;
									}).then(function(){
										if(product.salesPrice <= 0 ){
											alert("商品价格存在问题，请维护!");
											return;
										}
								    	product.rowNum = $scope.addId.rowNum;
										$scope.addId.rowNum = $scope.addId.rowNum + 2;
								    	// alert(JSON.stringify($scope.entries));
								    	$scope.entries.push(product);
								    	// $scope.$apply();//刷新
									})
							    }

							});
						}
					};
				}]);
})();