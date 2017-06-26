(function() {
	'use strict';

	angular
		.module('newhope')
		.controller('DispatchArealistCtrl', DispatchArealistCtrl)
		.controller('DetailModalCtrl', DetailModalCtrl)
		.controller('UpdateAreaModalCtrl', UpdateAreaModalCtrl)
		.controller('AddModalCtrl', AddModalCtrl);
	
	DispatchArealistCtrl.$inject = ['$rootScope','$alert','$http','$scope','$state', '$resource', '$uibModal', 'restService'];

	function DispatchArealistCtrl($rootScope,$alert,$http, $scope,$state, $resource, $uibModal, rest) {
		var pvm = this;var vm = $scope;
		pvm.tbLoding = -1;
		pvm.content = []; //定义的需要数据的集合，
		pvm.pageno = 1; // 初始化页码为1
		pvm.curPageno = 1;
		pvm.total_count = 0; //页码总数
		pvm.itemsPerPage = 10; //每页显示条数
		$scope.search = {};
		var province = '';
    	var city = '';
    	var county = '';
		pvm.getData = function(pageno) {
			pvm.tbLoding = 1;
            pvm.content = [];
            pvm.total_count = 0;
			var params = {
				pageNum: pageno,
				pageSize: pvm.itemsPerPage
			}
			if (typeof(vm.areaSelect) !== 'undefined' && vm.areaSelect.length > 0) {
				if (vm.areaSelect[0]) {
					params.province = vm.areaSelect[0].itemCode;
				}
				if (vm.areaSelect[1]) {
					params.city = vm.areaSelect[1].itemCode;
				}
				if (vm.areaSelect[2]) {
					params.county = vm.areaSelect[2].itemCode;
				}
			}
			
			// liuyin   add    start
			var xqdz = document.getElementById('xqdz').value; 
			  params.areaTxt=xqdz;
			// liuyin   add end
			rest.getAreaList(params).then(function(json) {
				pvm.tbLoding = 0;
				pvm.content = json.data.list;
				pvm.total_count = json.data.total;
			}, function (reject) {
				var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                pvm.tbLoding = 0;
			});
		};

        pvm.getData(pvm.pageno); 

        vm.doSearch = function(params){
        	
        	vm.curPageno = 1
        	pvm.getData(vm.curPageno);
        }

		  	vm.form = {};

		/*	codeMapService.stations('/dic/find/child/items','{"typeCode": "1001","parent": "-1"}').then(function (data) {
		  		alert(JSON.stringify(data));
				vm.provinces = data;
			})*/

		  /*	$http({
	        	url:vm.app.preUrl + '/dic/find/child/items',
	        	method:'POST',
	        	data:{"typeCode": "1001","parent": "-1"}
	        }).success(function(data,header,config,status){
	            vm.provinces = angular.copy(data.data);
	        });*/

	    vm.getCitys = function(){
        	 if(vm.form.province != null){
			    $http({
		        	url:vm.app.preUrl + '/dic/find/child/items',
		        	method:'POST',
		        	data:{"typeCode": "1001","parent":vm.form.province}
		        }).success(function(data,header,config,status){
		            vm.citys = angular.copy(data.data);
		        });
	         }

        }
		$scope.status =[
			{"code": "absorbed","name": "已分配"},
			{"code": "unabsorbed","name": "未分配"}];

			
 		$scope.typeSelected = function(data){
            if(data!=undefined){
                $scope.choseStation = true;
                rest.getBranchByDealer(data.dealerNo).then(function(json){
                    $scope.milkStations = json.data;
                })                
            }else {
                vm.choseStation = false;
            }
        }

        if ($rootScope.$storage.user && $rootScope.$storage.user.dealerId && !$rootScope.$storage.user.branchNo) {
            $scope.dealers = [{
                dealerNo: $rootScope.$storage.user.dealerId, 
                dealerName: $rootScope.$storage.user.dealerName
            }];
            $scope.search.dealerNo = $rootScope.$storage.user.dealerId;
            $scope.typeSelected(vm.dealers[0]);
        } else {
            //获取该组织下经销商列表信息
            rest.priceDealers().then(function(json){
                $scope.dealers = json.data;
            })
        }

        //配送区域信息导出
        $scope.downArea = function(){
        	var params = {
        		branchNo:$scope.search.branchNo
        	}
        	console.log(params)
        	rest.exportArea(params).then(function(json){
                rest.reportDeliverFile(json.data);
            }) 
        }
		vm.allocatRoute = function(){
			//alert(JSON.stringify(vm.dt.checked));
			$state.go('newhope.allocatRoute');
		}
		vm.deleteRoute = function(data){
			rest.deleteAreaById(data).then(function(json) {
				pvm.getData(pvm.curPageno);
				//console.log(json)
			});
			//需要判断删除的信息是否为未分配
			//alert("删除成功");			
			//$state.go('newhope.allocatRoute');
		}


		vm.dispatchAreaDetail = function(id) {
			var modalInst = $uibModal.open({
				templateUrl: 'views/basic_info/nh_dispatchAreaDetail.html',
				controller: 'DetailModalCtrl',
				size: 'lg',
				resolve: {
					AreaItem: function() {
						return rest.getAreaById(id);
					}
				}
			});
		}
		vm.addDispatchArea = function(){
			//alert(JSON.stringify(vm.dt.checked));
			var modalInst = $uibModal.open({
				templateUrl: 'views/basic_info/nh_addArea.html',
				controller: 'AddModalCtrl',
				size: 'lg'
			});
			modalInst.result.then(function () {
				pvm.curPageno = 1;
				pvm.getData(pvm.curPageno);
			})
		}

		vm.updateDispatchArea = function(data){
				var modalInst = $uibModal.open({
					templateUrl: 'views/basic_info/nh_updateArea.html',
					controller: 'UpdateAreaModalCtrl',
					size: 'lg',
					resolve: {
						AreaItem: function() {
							return rest.getAreaById(data);
						}
					}
				});
				modalInst.result.then(function () {
					pvm.getData(pvm.curPageno);
				})
			
		}
		
		$scope.allocatArea = function(){
			$state.go('newhope.dispatchArea');
		}


	}

	DetailModalCtrl.$inject = ['$scope', '$uibModalInstance', 'AreaItem'];

	function DetailModalCtrl($scope, $uibModalInstance, AreaItem) {

		var vm = $scope;

		vm.Areainfo = {};
		vm.cancelModal = cancelModal;
		vm.atm = AreaItem.data;

		/*AreaItem.get(function(resp) {
            vm.Areainfo= resp.data;
        });*/
		function cancelModal() {
			$uibModalInstance.dismiss('cancel');
		}

	}

	UpdateAreaModalCtrl.$inject = ['$alert', '$scope', '$uibModalInstance', 'AreaItem', 'restService'];

	function UpdateAreaModalCtrl($alert, $scope, $uibModalInstance, AreaItem, restService) {
		var vm = $scope;
		vm.area = {};
		vm.cancelModal = cancelModal;
		vm.atm = AreaItem.data;
		vm.udatmselectupt = [];
		if(vm.atm.provinceName!=undefined){
			vm.udatmselectupt[0] = {
				itemCode: vm.atm.province,
				itemName: vm.atm.provinceName
			}
		}
		if(vm.atm.cityName!=undefined){
			vm.udatmselectupt[1] = {
				itemCode: vm.atm.city,
				itemName: vm.atm.cityName
			}
		}
		if(vm.atm.countyName!=undefined){
			vm.udatmselectupt[2] = {
				itemCode: vm.atm.county,
				itemName: vm.atm.countyName
			}
		}

        vm.areaForm =function(){
        	
        	vm.saveAtm={};
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
        	vm.atm.province = vm.udatmselectupt[0].itemCode;
			vm.atm.city = vm.udatmselectupt[1].itemCode;
			vm.atm.county = vm.udatmselectupt[2].itemCode;
        	restService.saveAreaUpt(vm.atm).then(function(json){
				if (json.type == 'success') {
					var alert = $alert({
						content: '保存成功!',
						container: '#modal-alert'
					})
					alert.$promise.then(function() {
						alert.show();
					}).then(function () {
						closeModal();
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
		function cancelModal() {
			$uibModalInstance.dismiss('cancel');
		}
		function closeModal() {
			$uibModalInstance.close();
		}
	}

	AddModalCtrl.$inject = ['$alert', '$scope', '$uibModalInstance', 'restService'];

	function AddModalCtrl($alert, $scope, $uibModalInstance, restService) {
		var vm = $scope;
		vm.atm = {};
		vm.area = {};
		vm.cancelModal = cancelModal;
		vm.areaForm =function(){
			if (typeof(vm.atmselectAdd) === 'undefined' || vm.atmselectAdd.length < 3) {
        		var alert = $alert({
					content: '请选择完整的省市区信息！',
					container: '#modal-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
        	} else {
        		vm.atm.province = vm.atmselectAdd[0].itemCode;
				vm.atm.city = vm.atmselectAdd[1].itemCode;
				vm.atm.county = vm.atmselectAdd[2].itemCode;
				// vm.atm.street = vm.atmselectAdd[3].itemCode;
				restService.addArea(vm.atm).then(function(json){
					if (json.type == 'success') {
						var alert = $alert({
							content: '保存成功!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						}).then(function () {
							closeModal();
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
				})
        	}
		}			
		function cancelModal() {
			$uibModalInstance.dismiss('cancel');
		}
		function closeModal() {
			$uibModalInstance.close();
		}
	}
})();