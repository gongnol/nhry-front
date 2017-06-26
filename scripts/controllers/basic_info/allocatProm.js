(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('alloctPromCtrl', alloctPromCtrl);

 	alloctPromCtrl.$inject = ['$alert','$compile', '$state','$scope','$http', '$resource', '$uibModal','restService'];

	function alloctPromCtrl($alert,$compile,$state, $scope, $http,$resource, $uibModal,rest) {
		var vm = $scope;
        //取得公司下奶站信息
 		vm.bAsync = {};
 		vm.promotions  = [];
 		vm.content = [];

 		vm.options = {
		    title: '',
		    filterPlaceHolder: '奶站筛选根据奶站名称,奶站编号查询',
		    orderProperty: '',
		    selectedItems:[]
		    
		}; 

        //获取该销售组织下的所有促销信息

         rest.selectPromsBySelesOrg().then(function(json){
        	vm.promotions = json.data;
        }); 

		 $scope.returnBack = function (){
			$state.go('newhope.promotionlist');
		}



		 //双向选择列表
		$scope.transfer = function(prom,flag1,from, flag2,to, index) {
			if(prom!=undefined){
				if (index >= 0) {
					//单个
					if(flag2){
						var branchNos = [];
						branchNos.push(from[index].branchNo);
						var params = {
							branchNos:branchNos,
							promNo:prom
						}
						//判断该促销是否已经在该奶站下 已经有订单
						rest.promotionHasOrder(params).then(function(json){
				        	if(json.type=="success"){

				        		to.push(from[index]);
									from.splice(index, 1);	

				        	}
				        }, function (reject) {
	                    	var alert = $alert({
								content: reject.msg,
								container: '#modal-alert'
							})
							alert.$promise.then(function() {
								alert.show();
							})
		        			
		        			return ;
		                }); 

					}else{
						to.push(from[index]);
						from.splice(index, 1);	
					}
					
				} else {
					var branchNos = [];
					for (var i = 0; i < from.length; i++) {
						branchNos.push(from[i].branchNo);
					}
					var params = {
							branchNos:branchNos,
							promNo:prom
					}
					//判断该促销是否已经在该奶站下 已经有订单
					rest.promotionHasOrder(params).then(function(json){
			        	if(json.type=="success"){
			        		for (var i = 0; i < from.length; i++) {
									to.push(from[i]);
								}	
								from.length = 0;
		        		}
			        }, function (reject) {
	                     var alert = $alert({
							content: reject.msg,
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
	        			
	        			return ;
	                }); 


				}
			}else{
				confirm("请选择奶站后在进行分配区域操作");
			}
		};



		vm.searchBranchs = function () {
        	vm.isLoding = true;
        	
        	rest.getBranchList({content: vm.searchTerm}).then(function (json) {
        		vm.content = json.data;
        		//配送列表如果与奶站有重复小区地址，清除配送列表里的重复数据
        		if($scope.options.selectedItems!=''){
        			for(var t=0;t<$scope.options.selectedItems.length;t++){
	        			for(var i=0;i<vm.content.length;i++){
        				    if(vm.content[i]!=undefined && $scope.options.selectedItems[t]!=undefined&& vm.content[i].branchNo==$scope.options.selectedItems[t].branchNo){
	        					vm.content.splice(i,1);
	        				}	        				
	        			}
	        		}


        		}
        		vm.isLoding = false;
        	})
        }


        //获取获取选择促销信息下关联的奶站信息列表
       vm.getBranchListByPromNo =function(data){
        	if(data!=undefined){
        		var params = {
        			promNo:data
        		}
	        	rest.getBranchsByPromNo(params).then(function(json){
	        		$scope.options.selectedItems = json.data;
	        		//配送列表如果与促销有重复奶站，清除配送列表里的重复数据
	        		if($scope.options.selectedItems!=''){
	        			for(var t=0;t<$scope.options.selectedItems.length;t++){
		        			for(var i=0;i<vm.content.length;i++){
	        				    if(vm.content[i]!=undefined && $scope.options.selectedItems[t]!=undefined&& vm.content[i].id==$scope.options.selectedItems[t].id){
		        					vm.content.splice(i,1);
		        				}	        				
		        			}
		        		}

	        		}
	        	});
        	}else{
        		$scope.options.selectedItems =[];
        	}
        };




        vm.pressEnterSearch = function (e) {
        	if (e.keyCode == 13) {
                vm.searchBranchs();
            }
        }      
   		



   		  //保存分配给奶站后的区域
        $scope.saveBranchs = function(promNo){
        	alert(promNo!=undefined);
        	if(promNo!=undefined){
	        	var msId = [];
	        	for (var i = 0; i < $scope.options.selectedItems.length; i++) {
						msId.push($scope.options.selectedItems[i].branchNo);
					}
				var params = {
					promNo:promNo,
					branchNos:msId
				}
				//alert(JSON.stringify(params));
				rest.relBranchByPromNo(params).then(function(json){
					if(json.type='success'){
						var alert = $alert({
							content: '保存成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
					}

				}); 
	        	////console.log(branchsNo);//被选中的奶站branchsNo编号  		
        	}
        	
		}

	}	

})();