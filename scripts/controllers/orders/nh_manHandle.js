/**
 * @ngdoc Controller
 * @name nh_manHandle
 *
 * 人工分单列表控制器
 */
(function() {
	'use strict';
	angular
		.module('newhope')
		.controller('ManHandleCtrl', ManHandleCtrl)
		.controller('DetailModalCtrl', DetailModalCtrl)
		.controller('CancelOrderModal', CancelOrderModal)
        .controller('deleteOrderModal', deleteOrderModal);

	ManHandleCtrl.$inject = ['$state','$scope', '$uibModal', '$alert', 'restService'];

	function ManHandleCtrl($state, $scope, $uibModal, $alert, rest) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.search={};
         $scope.fuzzySearch= function (e) {
            if (!e || e.keyCode == 13) {
              vm.curPageno = 1;
              vm.getData(vm.curPageno); 
            }
        }
        vm.getData = function(pageno){ 
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                // preorderStat:vm.search.preorderStat,/*退回的订单是否处理，还是已经退定的*/
                orderDateStart:vm.search.orderDateStart,
                orderDateEnd:vm.search.orderDateEnd,
                orderNo:vm.search.fuzzySearch,
                retReason:vm.search.retReason
            }

            rest.manHandleOrders(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
        };

        vm.getData(vm.pageno); // Call the function to fetch initial data on page load.

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
        vm.statusFormat = function (status) {
        	if("10" == status){
        		return "已确认";
        	}
        	if("20" == status){
				return "未确认";
        	}
        	return "";
        }
        vm.reasonFormat = function (status) {
        	if("10" == status){
        		return "不在配送区域";
        	}
        	if("20" == status){
				return "订单信息有误";
        	}
            if("30" == status){
                return "无法满足客户需求";
            }
            if("40" == status){
                return "其他原因";
            }
        	return "";
        }  
	    /*angulartable end*/

		vm.handle = {
			statuses: [{
				label: '未确认',
				code: '20'
			}, {
				label: '已确认',
				code: '10'
			}],
			reasons: [{
				label: '不在配送区域',
				code: '10'
			}, {
				label: '订单信息有误',
				code: '20'
			}, {
                label: '无法满足客户需求',
                code: '30'
            }, {
                label: '其他原因',
                code: '40'
            }]
		};

		vm.showDetail = showDetail;
		vm.cancelOrder = cancelOrder;
        vm.deleteOrder = deleteOrder;

		function showDetail(orderNo) {
			var modalInst = $uibModal.open({
				templateUrl: 'orderDetail.html',
				controller: 'DetailModalCtrl',
				size: 'lg',
				resolve: {
					orderNo: function() {
						return orderNo;
					},
					rest:rest
				}
			});
			modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
		}

		function cancelOrder(orderNo) {
			var modalInst = $uibModal.open({
				templateUrl: 'cancelOrderModal.html',
				controller: 'CancelOrderModal',
				size: 'md',
				resolve: {
					orderNo: function() {
						return orderNo;
					},
					rest:rest
				}
			});
			modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
		}

        /*订单作废*/
        function deleteOrder(orderNo){
            var modalInst = $uibModal.open({
                templateUrl: 'deleteOrderModal.html',
                controller: 'deleteOrderModal',
                size: 'lg',
                resolve: {
                    orderNo: function() {
                        return orderNo;
                    },
                    rest: rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

		vm.reloadTable = function() {
            vm.curPageno = 1;
            vm.getData(vm.pageno);
        }

        /*编辑订单*/
        vm.editOrder = function(orderNo){
        	// $state.go("newhope.orderEdit",{orderNo:orderNo});
            var url = $state.href('newhope.orderEdit', {orderNo: orderNo});
            window.open(url,'_blank');
        } 
	}

    CancelOrderModal.$inject = ['$scope','$uibModalInstance', '$alert', 'orderNo', 'rest'];

	function CancelOrderModal($scope, $uibModalInstance, $alert,orderNo,rest) {
		var vm = $scope;
        vm.order = {};
        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};
        vm.backReasons = {
            data:[
            {"code":"10","text":"个人原因"}, 
            {"code":"20","text":"质量原因"},
            {"code":"30","text":"服务问题"},
            {"code":"40","text":"其他，填写备注"}]
        };

        function save() {
            if(vm.handle.reason==undefined||vm.handle.reason==""){
                var cancelAlert = $alert({
                        content: '请选择退订原因!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
            }
            if(vm.handle.reason=="40"&&(vm.handle.memoTxt==undefined||$.trim(vm.handle.memoTxt)=="")){
                var cancelAlert = $alert({
                        content: '选择其他原因时，请输入备注!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
            }
            rest.cancelOrder(vm.handle).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    var cancelAlert = $alert({
                        content: '订单已取消!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                }
             },function(json){
                var saveAlert = $alert({
                    content: '操作失败！' + json.data.msg,
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

    deleteOrderModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'rest'];

    function deleteOrderModal($scope, $state, $alert, $uibModalInstance, orderNo, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.returnReasons = {
            data:[
            {"code":"10","text":"不在配送区域"},
            {"code":"20","text":"订单信息有误"},
            {"code":"30","text":"无法满足客户需求"},
            {"code":"40","text":"其他原因,填写备注"}]
        };

        vm.params = {"orderNo":orderNo,'preorderStat':'40'};

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            if(vm.params.deleteReason == '40' && $.trim(vm.params.memoTxt) == '' ){
                var saveAlert = $alert({
                        content: '请填写备注！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
            }else{
                rest.uptOrderStatus(vm.params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '作废成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
                }, function (reject) {
                    var errorAlert = $alert({
                        title: reject.data.type,
                        content: reject.data.msg,
                        container: '#modal-alert'
                    })
                    errorAlert.$promise.then(function () {
                        errorAlert.show();
                    })
                });
            }
        }

    }

    DetailModalCtrl.$inject = ['$scope','$uibModalInstance', '$alert', 'orderNo', 'rest'];

	function DetailModalCtrl($scope, $uibModalInstance, $alert, orderNo,rest) {
		var vm = $scope;
		vm.order = {};
		vm.editOrder = editOrder;
		vm.cancelModal = cancelModal;
		vm.handle = {};

		rest.orderDetail(orderNo).then(function(json){
            var result = json.type;
            if(result == 'success'){
                vm.order = json.data
                // vm.order = json.data.order;

            }else{
            	var saveAlert = $alert({
					content: '加载失败！' + result.msg,
					container: '#body-alert'
				})
				saveAlert.$promise.then(function () {
	                saveAlert.show();
	            })
            }
        }); 

        rest.branchSearch().then(function(json){
              vm.branchs = json.data;   
        });

		/*奶站查询*/
        $scope.stations = {
            data:[
        {"code":"001","text":"奶站1"},
        {"code":"002","text":"奶站2"},
        {"code":"003","text":"奶站3"}]
        };

		function editOrder() {
			vm.handle.orderNo = vm.order.order.orderNo;
			vm.handle.branchNo = vm.order.order.branchNo;
			rest.manHandleDo(vm.handle).then(function(json){
	            var result = json.type;
	            if(result == 'success'){
					var saveAlert = $alert({
						content: '保存成功！',
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
		            }).then(function(){
                        closeModal();
                    })
	            }else{
	            	var saveAlert = $alert({
						content: '保存失败！' + result.msg,
						container: '#modal-alert'
					})
					saveAlert.$promise.then(function () {
		                saveAlert.show();
		            })
	            }
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