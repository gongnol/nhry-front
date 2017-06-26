(function() {
	'use strict';
	angular
	  .module('newhope')
      .controller('requiredOrderCtrl', requiredOrderCtrl)
      .controller('returnOrderModal', returnOrderModal)
      .controller('confirmOrderModal', confirmOrderModal)
      .controller('batchConfirmOrderModal', batchConfirmOrderModal)
      .controller('chooseVipModal', chooseVipModal)
      .controller('deleteOrderModal', deleteOrderModal)
      .controller('selectEmpModal', selectEmpModal);

	requiredOrderCtrl.$inject = ['$rootScope','$state', '$scope','$uibModal','$alert','restService', 'nhCommonUtil'];

	function requiredOrderCtrl($rootScope, $state, $scope, $uibModal, $alert ,rest, nhCommonUtil) {

        var pvm = this; var vm = $scope;
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
            {'code':'60','text':'电话'},
            {'code':'90','text':'特殊'}
        ];
        $scope.batchCharging6 = false;
        // if (typeof($rootScope.curPage_Record) == 'number' && $rootScope.curPage_Record !== 0) {
        //     vm.curPageno = $rootScope.curPage_Record;
        //     $rootScope.curPage_Record = 0;
        // } else {
        //     vm.curPageno = 1;
        // }
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                preorderStat:"20",/*20代表未生效的订单，需要确认*/
                orderNo:vm.search.fuzzySearch,
                orderDateStart:vm.search.orderDateStart,
                orderDateEnd:vm.search.orderDateEnd,
                preorderSource: vm.search.preorderSource
            }

            rest.orders(params).then(function (json) {
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

        vm.getData(vm.curPageno); // Call the function to fetch initial data on page load.

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
	    /*angulartable end*/

        vm.orderSourceFmt = function (code) {
            if("10" === code)return '电商';
            if("20" === code)return '征订';
            if("30" === code)return '奶站';
            if("40" === code)return '牛奶钱包';
            if("50" === code)return '送奶工App';
            if("60" === code)return '电话';
            if("90" === code)return '特殊';
        }

        vm.orderSourceFmt = function (code,type) {
            if("10" === code )return '电商';
            if("20" === code)return '征订';
            if("Z017" === type)return '年卡';
            if("30" === code )return '奶站';
            if("40" === code)return '牛奶钱包';
            if("50" === code)return '送奶工App';
            if("60" === code)return '电话';
            if("70" === code)return '机构';
            if("90" === code)return '特殊';

        }
	    
	    vm.toOrderDetail = function(orderNo){
            // $rootScope.curPage_Record = vm.curPageno;
            // $state.go("newhope.orderDetail", {orderNo: orderNo});
            var url = $state.href('newhope.orderDetail', {orderNo: orderNo});
            window.open(url,'_blank');
    	};

        /*刷新datatable*/
        vm.reloadTable = function(){
            vm.curPageno = 1;
            vm.getData(vm.curPageno);
        }

        vm.confirmOrder =function(orderNo,empNo){

             var modalInst = $uibModal.open({
                templateUrl: 'confirmOrderModal.html',
                controller: 'confirmOrderModal',
                size: 'md',
                resolve: {
                    param: function() {
                        return {
                            "orderNo":orderNo,
                            "empNo":empNo
                        };
                    }, 
                    pScope: vm,
                    rest: rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })

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
            var modalInst = $uibModal.open({
                templateUrl: 'confirmOrderModal.html',
                controller: 'batchConfirmOrderModal',
                size: 'md',
                resolve: {
                    orders: function() {
                        return vm.checkboxArrs;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
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

        /*选择订户*/
        vm.chooseVip  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'chooseVipModal.html',
                controller: 'chooseVipModal',
                size: 'xxls',
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

        /*选择订户*/
        vm.selectEmp  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'selectEmpModal.html',
                controller: 'selectEmpModal',
                size: 'md',
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

    selectEmpModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];
    function selectEmpModal($scope, $uibModalInstance, $alert,orderNo,rest) {
        var vm = $scope;
        //默认值
        vm.order = {};
        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};
        vm.emps = {};

        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
                var result = json.type;
                if(result == 'success'){
                    vm.emps.data = json.data;
                }
                },function(json){
                    var saveAlert = $alert({
                        content: '加载送奶员失败！'+json.data.msg,
                        container: '#body-alert'
                    })
                        saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })

        });

        function save() {
            if(vm.handle.empNo==undefined||vm.handle.empNo==""){
                var cancelAlert = $alert({
                        content: '请选择送奶员!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
            }
            rest.uptOrderStatus(vm.handle).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '更新送奶员成功！',
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

        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }


    confirmOrderModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'param', 'pScope', 'rest'];
    function confirmOrderModal($scope, $state, $alert, $uibModalInstance, param, pScope, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.params = {"orderNo":param.orderNo,"empNo":param.empNo};
        vm.emps = [];
        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
                var result = json.type;
                    if(result == 'success'){
                        vm.emps.data = json.data;
                    }
                },function(json){
                    var saveAlert = $alert({
                        content: '加载送奶员失败！'+json.data.msg,
                        container: '#body-alert'
                    })
                        saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })

        });
        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            $scope.batchCharging6 = true;
           if(vm.params.empNo==undefined||vm.params.empNo==""){
               $scope.batchCharging6 = false;
                var cancelAlert = $alert({
                        content: '送奶员不能为空!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
            }else{
                rest.orderConfirm(vm.params).then(function(json){
                    $scope.batchCharging6 = false;
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '确定成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
                }, function (reject) {
                    $scope.batchCharging6 = false;
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

    batchConfirmOrderModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orders', 'restService'];

    function batchConfirmOrderModal($scope, $state, $alert, $uibModalInstance, orders, rest) {
        var vm = $scope;
        var orderStr = orders.reduce(function (preVal, curVal) {
            return preVal + ',' + curVal;
        })
        
        vm.emps = [];
        vm.param = {};
        vm.params = {"orderNo":orderStr,"empNo":vm.param.empNo};
        
        vm.cancelModal = cancelModal;
        vm.save = save;

        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
            var result = json.type;
                if(result == 'success'){
                    vm.emps.data = json.data;
                }
            }, function(json){
                var saveAlert = $alert({
                    content: '加载送奶员失败！'+json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
        });

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            if(!vm.params.empNo){
                var cancelAlert = $alert({
                    content: '送奶员不能为空!',
                    container: '#modal-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }else{
                rest.batchOrderConfirm(vm.params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '确定成功！',
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

    chooseVipModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'pScope', 'rest'];

    function chooseVipModal($scope, $state, $alert, $uibModalInstance, orderNo, pScope, rest) {
        $scope.handle = {
            cStatuses: [{
                code: '10',
                label: '在订订户'
            }, {
                code: '20',
                label: '暂停订户'
            }, {
                code: '30',
                label: '停订订户'
            }, {
                code: '40',
                label: '退订订户'
            }]
        };

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.search = {};
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.milkmemberNo = "";
        vm.milkmemberName = "";

        vm.getData = function(pageno){
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                content:vm.search.telephone
            } 
            
            rest.getCsmList(params).then(function (json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };

        vm.getData(vm.pageno); // Call the function to fetch initial data on page load.

        vm.getObjByCode = function (code, arr) {
            var label = '',
                len = arr.length;
            for (var i = 0; i < len; i++) {
                var item = arr[i];
                if (item.code == code) {
                    label = item.label;
                    break;
                }
            }
            return label;
        }

        vm.reloadTable = function(){
            vm.getData(vm.pageno);
        }

        vm.chooseCustomer = function(cusNo,cusName){
            vm.milkmemberNo = cusNo;
            vm.milkmemberName = cusName;
        }
        /*订户信息查询end*/

        vm.params = {"orderNo":orderNo};

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {alert(orderNo+"/"+vm.milkmemberNo);
            var params = {};
            params.orderNo = orderNo;
            params.milkmemberNo = vm.milkmemberNo;
            rest.uptOrderStatus(params).then(function(json){
                var result = json.type;
                if(result == 'success'){
                    var saveAlert = $alert({
                        content: '选择订户成功！',
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    }).then(function(){
                        closeModal();
                        // vm.getData(vm.pageno);
                    })
                }
            },function(json){
                var saveAlert = $alert({
                        content: '更改失败！'+json.data.msg,
                        container: '#body-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                    })
            });
        }

    }

	
})();