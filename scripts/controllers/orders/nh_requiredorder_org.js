(function() {
	'use strict';
	angular
	  .module('newhope')
      .controller('requiredOrderOrgCtrl', requiredOrderOrgCtrl)
      .controller('returnOrderModal', returnOrderModal)
      .controller('deleteOrderModal', deleteOrderModal);

	requiredOrderOrgCtrl.$inject = ['$rootScope','$state', '$scope','$uibModal','$alert','restService', 'nhCommonUtil'];

	function requiredOrderOrgCtrl($rootScope, $state, $scope, $uibModal, $alert ,rest, nhCommonUtil) {

        var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        // vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 100; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.search={};
        vm.search.orderDateStart = nhCommonUtil.offsetMon(-2);
        vm.preorderSources = [
            {'code':'10','text':'电商'}, 
            {'code':'20','text':'征订'}, 
            {'code':'30','text':'奶站'}, 
            {'code':'40','text':'牛奶钱包'}, 
            {'code':'50','text':'送奶工App'}, 
            {'code':'60','text':'电话'}
        ];
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                orderNo:vm.search.fuzzySearch,
                orderDateStart:vm.search.orderDateStart,
                orderDateEnd:vm.search.orderDateEnd,
                preorderSource: vm.search.preorderSource
            }

            rest.searchPendingConfirmUnOnline(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            },function(json){
               var saveAlert = $alert({
                        content: ''+json.data.msg,
                        container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        };

        vm.getData(vm.curPageno); 

        vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        } 

        vm.orderSourceFmt = function (code) {
            if("10" === code)return '电商';
            if("20" === code)return '征订';
            if("30" === code)return '奶站';
            if("40" === code)return '牛奶钱包';
            if("50" === code)return '送奶工App';
            if("60" === code)return '电话';
        }
	    
	    vm.toOrderDetail = function(orderNo){
            var url = $state.href('newhope.orderDetail', {orderNo: orderNo});
            window.open(url,'_blank');
    	};

        /*刷新datatable*/
        vm.reloadTable = function(){
            vm.curPageno = 1;
            vm.getData(vm.curPageno);
        }

        vm.confirmOrder =function(orderNo){
            rest.orderConfirmUnOnline({orderNo: orderNo}).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    var saveAlert = $alert({
                        content: '订单确认成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
                    vm.getData(vm.curPageno);
                }
            }, function (reject) {
                var errorAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
            });
        }

        vm.batchConfirm = function () {
            if (!vm.checkboxArrs || vm.checkboxArrs.length < 1) {
                var saveAlert = $alert({
                    content: '请至少选择一个订单！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                return;
            }
            var orderStr = vm.checkboxArrs.reduce(function (preVal, curVal) {
                return preVal + ',' + curVal;
            });
            var params = {"orderNo":orderStr};
            if(confirm("是否确认以下订单\n" + orderStr)) {
                rest.batchOrderConfirmUnOnline(params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '确定成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                        vm.getData(vm.curPageno);
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

        /*订单导出*/
        vm.downloadUnConfirm = function () {
            rest.pendingUnConfirmOnlineReport().then(function (json) {
                rest.reportDeliverFile(json.data);
            })
        }

        /*订单退回*/
        vm.returnOrder  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'returnOrderModal.html',
                controller: 'returnOrderModal',
                size: 'lg',
                resolve: {
                    orderNo: function() {
                        return data;
                    }, 
                    pScope: vm,
                    rest: rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单作废*/
        vm.deleteOrder  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'deleteOrderModal.html',
                controller: 'deleteOrderModal',
                size: 'lg',
                resolve: {
                    orderNo: function() {
                        return data;
                    }, 
                    pScope: vm,
                    rest: rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

	}

    returnOrderModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'pScope', 'rest'];

    function returnOrderModal($scope, $state, $alert, $uibModalInstance, orderNo, pScope, rest) {

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

        vm.params = {"orderNo":orderNo,"retReason":"10"};

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            if(vm.params.retReason == '40' && $.trim(vm.params.memoTxt) == '' ){
                var saveAlert = $alert({
                        content: '请填写备注！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
            }else{
                rest.returnOrder(vm.params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '退回成功！',
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

    deleteOrderModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'pScope', 'rest'];

    function deleteOrderModal($scope, $state, $alert, $uibModalInstance, orderNo, pScope, rest) {

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
            if(vm.params.retReason == '40' && $.trim(vm.params.memoTxt) == '' ){
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
	
})();