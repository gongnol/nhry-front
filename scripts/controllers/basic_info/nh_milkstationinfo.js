
  (function() {
 	'use strict';
 	angular
		.module('newhope')
		.controller('MilkInfoCtrl', MilkInfoCtrl)
		.controller('AreaCtrl', AreaCtrl)
		.controller('empDetailCtrl',empDetailCtrl)
		.controller('priceDetailCtrl', priceDetailCtrl);

	MilkInfoCtrl.$inject = ['$scope', '$stateParams', '$alert', '$uibModal', '$state', 'restService'];
	function MilkInfoCtrl($scope, $stateParams, $alert, $uibModal, $state, rest) {
		/*****请求参数（奶站的编号）*****/
        var pvm = this; var vm = $scope;
        // 展开收起标识，默认展开
		vm.toggle1 = true;
		vm.toggle2 = true;
		vm.toggle3 = true;
        pvm.content = []; //定义的需要数据的集合，
        pvm.milkinfoPageno = 1; // 初始化页码为1
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 5; //每页显示条数
        //查找该奶站下配送区域
        pvm.getData = function(pageno) {

            var params = {
            	branchNo:$stateParams.branchNo,
                pageNum: pageno,
                pageSize: pvm.itemsPerPage
            }
            rest.searchAreaByBranchNo(params).then(function(json) {
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
            });
        };
		
        pvm.getData(pvm.milkinfoPageno);  
		var branchNo = $stateParams.branchNo;
		//查找该奶站下员工信息
		pvm.branchContent = [];
        pvm.empPageno = 1; // 初始化页码为1
        pvm.branchtotal_count = 0; //页码总数
        pvm.branchitemsPerPage = 5; //每页显示条数	
        
        pvm.getbranchData = function(pageno) {

            var params = {
            	branchNo:$stateParams.branchNo,
                pageNum: pageno,
                pageSize: pvm.branchitemsPerPage
            }
			rest.emplist(params).then(function(json){
				pvm.branchContent = json.data.list;
				pvm.branchtotal_count= json.data.total;
			})
        };	

		pvm.getbranchData(pvm.empPageno);
        vm.handle = {
            statuses: [{
                code: '0',
                label: '离职'
            }, {
                code: '1',
                label: '在职'
            }]
        };
        vm.getStatusLabel = function (status) {
            return vm.handle.statuses[Number(status)].label;
        }

		vm.editForm = $stateParams.edit;
        vm.editLabel = vm.editForm ? '保存' : '编辑';
        //获取奶站信息
        rest.getBranchInfo($stateParams.branchNo).then(function(json){
        	vm.nhmilks = json.data;
        })
        rest.getBranchExByNo($stateParams.branchNo).then(function(json){
        	vm.nhmilksEx = json.data;
        })
		vm.price ={};
        //根据奶站编号获取当前销售组织下该奶站适用范围内的价格组列表
        rest.getAreaPriceList($stateParams.branchNo).then(function(json){
			vm.prices = json.data;
        })
        //根据奶站编号获取当前销售组织下该奶站已经选择的价格组列表
 		rest.getBranchPriceList($stateParams.branchNo).then(function(json){
			vm.selectedPrice = json.data;
        })
       /*vm.selectedPrice = [
       	 	{"itemCode":"3","itemName":"城市价格组"}
        ];*/
        
        vm.form = {};
        
        vm.handle = {
            statuses: [{
                code: '0',
                label: '离职'
            }, {
                code: '1',
                label: '在职'
            }]
        };
       	vm.uptBankBranch =function(){
       		var params = {
       			branchNo:vm.nhmilks.branchNo,
       			payee:vm.nhmilks.payee,
       			openBank:vm.nhmilks.openBank,
       			bankAccount:vm.nhmilks.bankAccount
       		}
       		rest.uptBankBranch(params).then(function(json){
       			 if (json.type === 'success') {
        				var alert = $alert({
							content: '奶站账户更新成功!',
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
       	}
       	/**
       	 * 更新内部销售订单售达方更新
       	 */
       	vm.upttargetReason = function(){
       		var params={
       			branchNo:vm.nhmilks.branchNo,
       			targetPerson:vm.nhmilks.targetPerson
       		}
       		rest.uptTargetBranch(params).then(function(json){
       			 if (json.type === 'success') {
        				var alert = $alert({
							content: '内部销售订单售达方更新成功!',
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
       	}
        vm.addPriceGroup = function(data){
			if (data != undefined) {
				rest.getpriceGroupCode(data).then(function(json) {
					
					var params = {
						branchNo: $stateParams.branchNo,
						priceType: json.data.priceType,
						id: json.data.id
					}
					rest.addPriceBranch(params).then(function(jsonPb) {
						vm.selectedPrice.push({
							"id": data,
							"priceGroup": json.data.priceGroup,
							"priceTypeName":json.data.priceTypeName
						})
						if (jsonPb.type == 'success') {
							var alert = $alert({
								content: '保存成功!',
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

				})
			} else {
				var alert = $alert({
					content: '请选择价格组',
					container: '#modal-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
			}
        }

        vm.uptMSkostl = function () {
        	if (vm.nhmilksEx.kostl) {
        		var params = {
        			branchNo: $stateParams.branchNo,
        			kostl: vm.nhmilksEx.kostl
        		}
        		rest.uptKostl(params).then(function (resp) {
        			if (resp.type === 'success') {
        				var alert = $alert({
							content: '成本中心编码更新成功!',
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
        	} else {
        		var alert = $alert({
					content: '请填写成本中心编码！',
					container: '#modal-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
        	}
        }

        //查看价格组详细信息
        vm.showPriceDetail  = function(priceNo){
            var modalInst = $uibModal.open({
                templateUrl: 'priceDetail.html',
                controller: 'priceDetailCtrl',
                controllerAs: 'pdm',
                size: 'lg',
                resolve: {
                    priceItem: function() {
                       return rest.getpriceGroupCode(priceNo);
                    },
                    handle: vm.handle
                }
            });   
        }
        vm.removePriceGroup =function(id){
			rest.delPriceBranch($stateParams.branchNo, id).then(function(json){
				for (var i = 0; i < vm.selectedPrice.length; i++) {
					if (vm.selectedPrice[i].id == id) {
						vm.selectedPrice.splice(i, 1);
						var alert = $alert({
							content: '删除价格组成功',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
						break;
					}
				}
			},function(reject){
			var alert = $alert({
					content: '删除价格组失败'+reject.data.msg,
					container: '#modal-alert'
				})
				alert.$promise.then(function() {
					alert.show();
				})
				return ;
			});

        }

		vm.add = function(){
			$state.go('newhope.allocatRoute');
		}
		vm.del = function(){
			var checked = [];
			angular.element('input').each(function(idx, ele){
				var flag = $(this).prop('checked');
				var id = $(this).attr('id');
				$(ele).prop('checked', flag);
				if(flag){
					if(id!=undefined){
						checked.push(id);
					}
					
				}
			});
			if(checked==''){
						var alert = $alert({
							content: '请至少选择一个配送区域!',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})
			}else{
				//删除奶站下的配送区域delBranchScope
				
				rest.delBranchScope($stateParams.branchNo,checked).then(function(json) {
					pvm.getData(pvm.milkinfoPageno);
					if(json.type=='success'){
						var alert = $alert({
							content: '删除配送区域成功',
							container: '#modal-alert'
						})
						alert.$promise.then(function() {
							alert.show();
						})							
					}
				
				})
			}

		}

		vm.goEdit = function() {
				// vm.editForm = true;
				vm.editForm = !vm.editForm;
				vm.editLabel = vm.editForm ? '保存' : '编辑';
				if(!vm.editForm){
						var alert = $alert({
							content: '保存成功',
							container: '#body-alert'
						})
						alert.$promise.then(function () {
			                alert.show();
			            })
		            $state.go('newhope.milkstationlist');
				}			
		}
		//查看员工详情
		vm.showempDetail = function(id){
            var modalInst = $uibModal.open({
                templateUrl: 'empDetail.html',
                controller: 'empDetailCtrl',
                controllerAs: 'edm',
                size: 'xxls',
                resolve: {
                    empItem: function() {
                        return rest.empitem(id);
                    },
                    handle: vm.handle
                }
            });	
		}
		vm.areaDetail = function(id){
			var modalInst = $uibModal.open({
				templateUrl: 'views/basic_info/nh_dispatchAreaDetail.html',
				controller: 'AreaCtrl',
				size: 'lg',
				resolve: {
					AreaItem: function() {
						return rest.getAreaById(id);
					}
				}
			});

		}
		vm.returnBack = function (){
			$state.go('newhope.milkstationlist');
		}
		vm.save = function(){
			$state.go('newhope.milkstationlist');
		}
        $scope.dispatchArea = function() {
            $state.go('newhope.allocatRoute',{branchNo:$stateParams.branchNo});
        }
	}

	priceDetailCtrl.$inject = ['$scope', '$uibModalInstance', 'priceItem', 'restService'];

    function priceDetailCtrl($scope, $uibModalInstance, priceItem, restService) {
        
        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.pdm = priceItem.data;
       
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 5; //每页显示条数
        vm.getData = function(pageno){ 
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            restService.getPriceProList(vm.pdm.id,pageno,vm.itemsPerPage).then(function (json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };
        vm.getData(vm.pageno); 
        //vm.status = handle.statuses[Number(vm.status)].label;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

    }

    AreaCtrl.$inject = ['$scope', '$uibModalInstance', 'AreaItem'];

	function AreaCtrl($scope, $uibModalInstance, AreaItem) {
		var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.atm= AreaItem.data;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
	}

	empDetailCtrl.$inject = ['$scope', '$uibModalInstance', 'empItem', 'handle'];

	function empDetailCtrl($scope, $uibModalInstance, empItem, handle) {
        var vm = this;
        vm.cancelModal = cancelModal;

        angular.extend(vm, empItem.data.emp);
        
        if (vm.joinDate) {
            // vm.joinDate = vm.joinDate.slice(0, 10);
            vm.joinDate = moment(vm.joinDate).format('YYYY-MM-DD');
        }

        if (vm.status) {
            vm.status = handle.statuses[Number(vm.status)].label;
        }

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
	}
		
})();