(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('AllocatRouteCtrl', AllocatRouteCtrl);

 	AllocatRouteCtrl.$inject = ['$alert','$compile', '$state','$scope','$http', '$resource', '$uibModal','restService'];

	function AllocatRouteCtrl($alert,$compile,$state, $scope, $http,$resource, $uibModal,rest) {

		var vm = $scope;

 		vm.bAsync = {};
        if($state.params.branchNo!=""){
        	vm.bAsync = {selected : $state.params.branchNo}
        	rest.getBranchInfo($state.params.branchNo).then(function(json){
        		vm.branch = json.data; 
        		$scope.getBranchList($state.params.branchNo);

        	})
        }
        rest.branchSearch().then(function(json){
        	vm.branchAsync = json.data;
        }); 
		vm.content = [];
        vm.searchAreas = function () {
        	vm.isLoding = true;
        	
        	rest.searchAreaBySalesOrg({content: vm.searchTerm}).then(function (json) {
        		vm.content = json.data;
        		//配送列表如果与奶站有重复小区地址，清除配送列表里的重复数据
        		if($scope.options.selectedItems!=''){
        			for(var t=0;t<$scope.options.selectedItems.length;t++){
	        			for(var i=0;i<vm.content.length;i++){
        				    if(vm.content[i]!=undefined && $scope.options.selectedItems[t]!=undefined&& vm.content[i].id==$scope.options.selectedItems[t].id){
	        					vm.content.splice(i,1);
	        				}	        				
	        			}
	        		}


        		}
        		vm.isLoding = false;
        	})
        }

        vm.pressEnterSearch = function (e) {
        	if (e.keyCode == 13) {
                vm.searchAreas();
            }
        }       	
        //双向选择列表
		$scope.transfer = function(branchs,from, to, index) {
			if(branchs!=undefined){
				//console.log(index)
				if (index >= 0) {
					to.push(from[index]);
					from.splice(index, 1);
				} else {
					for (var i = 0; i < from.length; i++) {
						to.push(from[i]);
					}	
					from.length = 0;
				}
			}else{
				confirm("请选择奶站后在进行分配区域操作");
			}
		};
		$scope.options = {
		    title: '',
		    filterPlaceHolder: '配送区域筛选：根据省、市、区或小区名称查询',
		    orderProperty: '',
		    selectedItems:[]
		    
		}; 
		//获取选择奶站后奶站下关联的区域信息列表
        $scope.getBranchList =function(data){
        	if(data!=undefined){
	        	rest.getAreaByBranchNo(data).then(function(json){
	        		$scope.options.selectedItems = json.data;
	        		//配送列表如果与奶站有重复小区地址，清除配送列表里的重复数据
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
        //保存分配给奶站后的区域
        $scope.saveBcAd = function(branchsNo){
        	if(branchsNo!=undefined){
	         	////console.log(pvm.content);//选择后还剩余的区域
	         	/*rest.addArea($scope.options.selectedItems).then(function(json){

	         	})*/
	        	////console.log($scope.options.selectedItems);//选择后全部的选中的区域
	        	//选中配送区域信息ID
	        	var msId = [];
	        	for (var i = 0; i < $scope.options.selectedItems.length; i++) {
						msId.push($scope.options.selectedItems[i].id);
					}
				var params = {
					branchNo:branchsNo,
					residentialAreaIds:msId
				}
				rest.relBranch(params).then(function(json){
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
        	}else{
        		var alert = $alert({
							content: '请选择奶站后在进行分配区域操作!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
        	}

        }
	}

	

})();