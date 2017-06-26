/**
 * @ngdoc Controller
 * @name nh_manHandle
 *
 * 奶箱列表控制器
 */
(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('MilkBoxCtrl', MilkBoxCtrl)
		.controller('MbDetailModalCtrl', MbDetailModalCtrl)
		.controller('batchEditStatusModal', batchEditStatusModal);

	MilkBoxCtrl.$inject = ['$alert','$window', '$scope', '$uibModal','$stateParams', 'restService', 'nhCommonUtil'];

	function MilkBoxCtrl($alert,$window, $scope, $uibModal,$stateParams, rest, nhCommonUtil) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.search={};
        vm.search.setDateStart = nhCommonUtil.offsetMon(-2);

        if ($stateParams.orderNo) {
            vm.search.orderNo = $stateParams.orderNo;
        }

        vm.getData = function(pageno){ 
        	vm.allChFlag = false;
        	vm.tbLoding = 1;
            vm.content = [];
            vm.checkboxArrs = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                status:vm.search.status,
                // branchNo:vm.search.branchNo,
                emp:vm.search.emp,
                orderNo:vm.search.orderNo,
                setDateStart:vm.search.setDateStart,
                setDateEnd:vm.search.setDateEnd
            }

            rest.milkboxes(params).then(function (json) {
            	vm.tbLoding = 0;
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
        };

        vm.getData(vm.pageno); // Call the function to fetch initial data on page load.

        vm.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
            	vm.curPageno = 1;
                vm.getData(1);
            }
        }

        vm.printAll = function(empNo){
        	if(empNo!=undefined){
	        	rest.reportMilkBox(empNo).then(function(json){
	        		//console.log(json.data)
					rest.reportDeliverFile(json.data);
	                //$window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');
        		})        		
        	}else{
                var saveAlert = $alert({
                content: '请选择送奶员！',
                container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })        		
        	}

        }
        vm.dateFormat = function (dateStr) {
            // if ('ActiveXObject' in window) {
            //     return dateStr.slice(0, 10);
            // } else {
            //     var date = new Date(dateStr);
            //     var y = date.getFullYear();
            //     var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
            //     var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            //     return y + '-' + m + '-' + d;
            // }
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        } 

        vm.milkstatFormat = function (stat) {
            if(stat=="10")return "已安装";
            if(stat=="20")return "未安装";
            if(stat=="30")return "无需安装";
        } 

        vm.reloadTable = function(){
        	vm.curPageno = 1;
        	vm.getData(vm.pageno);
        }
	    /*angulartable end*/

	    vm.allEditStatus = function() {
	    	if(vm.checkboxArrs==undefined || ''==vm.checkboxArrs){
                var cancelAlert = $alert({
                    content: '请勾选需要修改的装箱单!',
                    container: '#body-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }
	    	vm.batchEditStatus();
	    }

	    rest.getAllEmpByBranchNo("").then(function (json) {
              vm.canSelectEmps = json.data;
        });

        // rest.getBranchList().then(function (json) {
        //     vm.stations = json.data;
        // });
        
		vm.handle = {
			statuses: [{
				label: '已安装',
				code: '10'
			}, {
				label: '未安装',
				code: '20'
			}, {
				label: '无需安装',
				code: '30'
			}]
		};
		// vm.dt = {};
  //       vm.dt.checked = [];

		vm.detail = detail;
		vm.mbUpdate = mbUpdate;
		vm.printMbOrder = printMbOrder;

		function detail(id,status,orderNo) {
			var modalInst = $uibModal.open({
				templateUrl: 'mbDetail.html',
				controller: 'MbDetailModalCtrl',
				size: 'lg',
				resolve: {
					mbItem: function() {
						return rest.milkboxPlan(id);
					},
					status: function() {
						return status;
					},
					orderNo:function() {
						return orderNo;
					},
					pScope: vm,
					rest:rest,
				update: false	// 标识是否在弹出框显示详情信息
				}
			});
			modalInst.result.then(function() {
				vm.getData(vm.curPageno);
            })
		}

		function mbUpdate(id,status,orderNo) {
			var modalInst = $uibModal.open({
				templateUrl: 'mbDetail.html',
				controller: 'MbDetailModalCtrl',
				size: 'lg',
				resolve: {
					mbItem: function() {
						return rest.milkboxPlan(id);
					},
					status: function() {
						return status;
					},
					orderNo:function() {
						return orderNo;
					},
					pScope: vm,
					rest:rest,
					update: true	// 标识是否在弹出框显示详情信息
				}
			});
			modalInst.result.then(function() {
				vm.getData(vm.curPageno);
            })
		}

		/*装箱单批量修改*/
        vm.batchEditStatus  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'batchEditStatus.html',
                controller: 'batchEditStatusModal',
                size: 'md',
                resolve: {
                    planNo: function() {
                        return vm.checkboxArrs;
                    },
                    pScope: vm,
                    rest:rest
                }
            });
            modalInst.result.then(function() {
				vm.getData(vm.curPageno);
            })
        }

		/*打印装箱单*/
		function printMbOrder() {
			alert('printMbOrder');
		}

	}

	batchEditStatusModal.$inject = ['$scope','$uibModalInstance', '$alert', 'planNo','pScope', 'rest'];

	function batchEditStatusModal($scope, $uibModalInstance, $alert, planNo, pScope , rest) {
		var vm = $scope;
		vm.milkBox = {"status":"20","setDate":new Date()};
		vm.handle = pScope.handle;
		vm.save = save;
		vm.cancelModal = cancelModal;

		function save() {
			vm.milkBox.code = '';
            for(var i= 0 ;i<planNo.length;i++){
                vm.milkBox.code = vm.milkBox.code + planNo[i] + ','
            }
			rest.milkboxBatchEditStatus(vm.milkBox).then(function(json){
                var result = json.type;
				if(result == 'success'){
					var saveAlert = $alert({
						content: '保存成功！',
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
		                closeModal();
		            })
				}
            },function(json){
            	var saveAlert = $alert({
						content: '保存失败！'+json.data.msg,
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
		                
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

	MbDetailModalCtrl.$inject = ['$scope','$uibModalInstance', '$alert', 'mbItem', 'pScope', 'status', 'orderNo', 'update', 'rest'];

	function MbDetailModalCtrl($scope, $uibModalInstance, $alert, mbItem, pScope,status,orderNo, update,rest) {
		var vm = $scope;
		vm.milkBox = {};
		vm.handle = pScope.handle;
		vm.update = update;
		vm.printMbOrder = pScope.printMbOrder;
		vm.save = save;
		vm.cancelModal = cancelModal;
		vm.status = status;
		//默认值
		vm.defaultValue={date:new Date()};

		vm.dateFormat = function (dateStr) {
            // if ('ActiveXObject' in window) {
            //     return dateStr.slice(0, 10);
            // } else {
            //     var date = new Date(dateStr);
            //     var y = date.getFullYear();
            //     var m = date.getMonth() + 1 <10 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1;
            //     var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            //     return y + '-' + m + '-' + d;
            // }
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

		/*mbItem.query(function(resp) {*/
		vm.milkBox = mbItem.data;

		if(update){
			rest.orderDetail(orderNo).then(function(json){
            	vm.orderDetail = json.data;
        	});
		}
		

		/*});*/

		function save() {
			if(update){
				vm.milkBox.entries = vm.orderDetail.entries;
			}
			rest.saveMilkboxPlan(vm.milkBox).then(function(json){
                var result = json.type;
				if(result == 'success'){
					var saveAlert = $alert({
						content: '保存成功！',
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
		                closeModal();
		            })
				}
            },function(json){
            	var saveAlert = $alert({
						content: '保存失败！'+json.data.msg,
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
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

})();