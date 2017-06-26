(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('currentOrgOrderCtrl', currentOrgOrderCtrl)  
      .controller('CancelOrderModal', CancelOrderModal)
      .controller('stopOrderModal', stopOrderModal)
      .controller('returnAllOrdersModal', returnAllOrdersModal)
      .controller('resumeOrderModal', resumeOrderModal)
      .controller('resumeOrderFromStopModal', resumeOrderFromStopModal)
      .controller('allContinueOrdersModal', allContinueOrdersModal)
      .controller('empChangeModal', empChangeModal)
      .controller('batchSearchByMpModal', batchSearchByMpModal)
      .controller('backOrderModal', backOrderModal);

	currentOrgOrderCtrl.$inject = ['$rootScope','$state','$stateParams','$scope','$uibModal', '$alert','restService', 'nhCommonUtil'];  

	function currentOrgOrderCtrl($rootScope, $state, $stateParams, $scope, $uibModal,  $alert , rest, nhCommonUtil) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.search={};
        vm.search.orderDateStart = nhCommonUtil.offsetMon(-2);
        vm.search.status = '10';

        vm.allStop = function(){
            if(vm.checkboxArrs==undefined || ''==vm.checkboxArrs){
                var cancelAlert = $alert({
                    content: '请勾选需要停订的订单!',
                    container: '#body-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }
            vm.returnAllOrders();
        };

        vm.allContinue = function(){
            if(vm.checkboxArrs==undefined || ''==vm.checkboxArrs){
                var cancelAlert = $alert({
                    content: '请勾选需要续订的订单!',
                    container: '#body-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }
            vm.continueAllOrders();
        };

        vm.empChange = function(){
            if(vm.checkboxArrs==undefined || ''==vm.checkboxArrs){
                var cancelAlert = $alert({
                    content: '请勾选需要替换送奶员的订单!',
                    container: '#body-alert'
                })
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                })
                return;
            }
            var modalInst = $uibModal.open({
                templateUrl: 'empChangeModal.html',
                controller: 'empChangeModal',
                size: 'lg',
                resolve: {
                    orders: function() {
                        return vm.checkboxArrs;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        };

        if ($stateParams.csmPhone) {
            vm.search.milkmemberNo = $stateParams.csmPhone;
        }

        if ($stateParams.orgId) {
            vm.search.orderByOrg = $stateParams.orgId;
        }
        
        vm.getData = function(pageno){ 
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {};
            if (vm.batchMps && vm.batchMps.length > 0) {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    mps: vm.batchMps
                }

                rest.searchOrderByMp(params).then(function (json) {
                    vm.tbLoding = 0;
                    vm.content = json.data.list;
                    vm.total_count = json.data.total;
                });
            } else {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    preorderStat: "10",/*10代表生效的订单*/
                    reason: "cancel",//查询包括了取消的订单
                    orderDateStart: vm.search.orderDateStart,
                    orderDateEnd: vm.search.orderDateEnd,
                    content: vm.search.content,
                    status: vm.search.status,
                    empNo: vm.search.empNo,
                    milkmemberNo: vm.search.milkmemberNo,
                    preorderSource: '70',
                    onlineSourceType: vm.search.orderByOrg,
                    preorderStat20F70Z017:'30'//查询出机构未确认订单
                }
                rest.orders(params).then(function (json) {
                    vm.tbLoding = 0;
                    vm.content = json.data.list;
                    vm.total_count = json.data.total;
                });
            }
        };

        /*模糊搜索*/
        vm.fuzzySearch = function (e) {
            if (!e || e.keyCode == 13) {
                vm.curPageno = 1;
                vm.getData(vm.curPageno);
            }
        }

        vm.getData(vm.curPageno); 

        vm.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }

        vm.signFormat = function (sign) {
           if("10"==sign)return '在订';
           if("20"==sign)return '停订';
           if("30"==sign)return '退订';
           if("40"==sign)return '完结';
        }

        vm.reloadTable = function(){
            vm.curPageno = 1;
        	vm.getData(vm.curPageno);
        }
        
        vm.statuses = [
            {'code':'10','text':'在订'},
            {'code':'20','text':'停订'},
            {'code':'30','text':'退订'},
            {'code':'40','text':'完结'}
        ];

        rest.getAllEmpByBranchNo("").then(function (json) {
              vm.canSelectEmps = json.data;
        });

        rest.getOrderOrgName().then(function (json) {
              vm.orglist = json.data;
        });

        vm.toOrderDetail = function(orderNo){
            var url = $state.href('newhope.orderDetail', {orderNo: orderNo});
            window.open(url,'_blank');
        };

        vm.toOrderEdit = function(orderNo){
            var url = $state.href('newhope.orderEdit', {orderNo: orderNo});
            window.open(url,'_blank');
        };

        vm.toOrderPlan = function(orderNo){
            var url = $state.href('newhope.demand', {orderNo: orderNo});
            window.open(url,'_blank');
        };

	    /////////modal区//////////
        /*订单取消*/
	    vm.cancelOrder = function(data,preorderSource) {
            if(preorderSource=="10"){
                if(confirm("该订单来自电商订单，确认退订？")){
                        var modalInst = $uibModal.open({
                            templateUrl: 'cancelOrderModal.html',
                            controller: 'CancelOrderModal',
                            size: 'md',
                            resolve: {
                                orderNo: function() {
                                    return data;
                                },
                                rest:rest
                            }
                        });
                        modalInst.result.then(function() {
                            vm.getData(vm.curPageno);
                        })
                }
            }else{
                  var modalInst = $uibModal.open({
                    templateUrl: 'cancelOrderModal.html',
                    controller: 'CancelOrderModal',
                    size: 'md',
                    resolve: {
                        orderNo: function() {
                            return data;
                        },
                        rest:rest
                    }
                });
                modalInst.result.then(function() {
                    vm.getData(vm.curPageno);
                })
            }
          
        }

        /*订单停订*/
        vm.returnOrder  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'stopOrderModal.html',
                controller: 'stopOrderModal',
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return data;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单续订*/
        vm.resumeOrder  = function(data,type){
            var modalInst = $uibModal.open({
                templateUrl: 'resumeOrderModal.html',
                controller: 'resumeOrderModal',
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return data;
                    },
                    paymentMethod: function() {
                        return type;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单复订*/
        vm.resumeOrderFromStop  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'resumeOrderFromStopModal.html',
                controller: 'resumeOrderFromStopModal',
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return data;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单退回*/
        vm.backOrder  = function(orderNo){
            var modalInst = $uibModal.open({
                templateUrl: 'backOrderModal.html',
                controller: 'backOrderModal',
                controllerAs: 'borm',
                size: 'lg',
                resolve: {
                    orderNo: function() {
                        return orderNo;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单批量停订*/
        vm.returnAllOrders  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'returnAllOrders.html',
                controller: 'returnAllOrdersModal',
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return vm.checkboxArrs;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*订单批量续订*/
        vm.continueAllOrders  = function(data){
            var modalInst = $uibModal.open({
                templateUrl: 'allContinueOrders.html',
                controller: 'allContinueOrdersModal',
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return vm.checkboxArrs;
                    },
                    rest:rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        /*按手机号批量筛选*/
        vm.batchSearchByMp = function(){
            var modalInst = $uibModal.open({
                templateUrl: 'batchSearchByMpModal.html',
                controller: 'batchSearchByMpModal',
                controllerAs: 'bsm',
                size: 'lg'
            });
            modalInst.result.then(function(arr) {
                vm.batchMps = arr;
                vm.curPageno = 1;
                vm.getData(vm.curPageno);
            })
        }

        vm.clearBatchSearch = function () {
            vm.batchMps = null;
            vm.curPageno = 1;
            vm.getData(vm.curPageno);
        }
        
        //机构内勤撤回订单
        vm.cancelOrderRequire = function(orderNo){
        	if(!orderNo){
        		return;
        	}
        	if(!window.confirm('是否确认撤回订单'+orderNo+'?')){
        		return;
        	}
        	rest.cancelOrderRequire({'orderNo':orderNo}).then(function(json){
        		if(json.type=='success'){
        			var cancelAlert = $alert({
                    	content: '撤回成功!',
                    	container: '#body-alert'
                	});
	                cancelAlert.$promise.then(function () {
	                    cancelAlert.show();
	                });
	                vm.getData(vm.curPageno);
        		}
        	}, function(json){
        		var cancelAlert = $alert({
                	content: '撤回失败!'+json.data.msg,
                	container: '#body-alert'
            	});
                cancelAlert.$promise.then(function () {
                    cancelAlert.show();
                });
        	});
        }
	}

    CancelOrderModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];

    function CancelOrderModal($scope, $uibModalInstance, $alert,orderNo,rest) {
        var vm = $scope;
        //默认值
        vm.cancelOrderSaving = false;
        vm.defaultValue={date:new Date()};
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
            
            if (!vm.isStopAhead) {
                vm.handle.backDate = undefined;
                vm.cancelOrderSaving = true;
                rest.cancelOrder(vm.handle).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '订单已取消!',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
                 },function(json){
                    var cancelAlert = $alert({
                        content: '操作失败！' + json.data.msg,
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    vm.cancelOrderSaving = false;
                }); 
            } else {
                if (!vm.handle.backDate) {
                    var cancelAlert = $alert({
                        content: '请选择提前退订开始日期!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
                }
                if (!moment(vm.handle.backDate).isAfter(vm.defaultValue.date)) {
                    var cancelAlert = $alert({
                        content: '必须指定今天以后的日期!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
                }
                vm.cancelOrderSaving = true;
                rest.advanceBackOrder(vm.handle).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '订单将于指定日期开始停订!',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
                },function(json){
                    var cancelAlert = $alert({
                        content: '操作失败！' + json.data.msg,
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    vm.cancelOrderSaving = false;
                });
            }
        }

        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }

        function closeModal() {
            $uibModalInstance.close();
        }
    }

    stopOrderModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];

    function stopOrderModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.stopOrderSaving = false;
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};
        // vm.stopReasons = {
        //     data:[
        //     {"code":"10","text":"个人原因"}, 
        //     {"code":"20","text":"质量原因"},
        //     {"code":"30","text":"服务问题"}]
        // };

        function save() {
            // if(vm.handle.reason==undefined||vm.handle.reason==""){
            //     var cancelAlert = $alert({
            //             content: '请选择停订原因!',
            //             container: '#modal-alert'
            //         })
            //         cancelAlert.$promise.then(function () {
            //             cancelAlert.show();
            //         })
            //     return;
            // }
            if(vm.handle.orderDateStart == undefined || $.trim(vm.handle.orderDateStart) =="" ){
                var cancelAlert = $alert({
                        content: '请至少选择停订开始日期!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            if(vm.handle.orderDateEnd == undefined && vm.handle.isLongStop==undefined){
                var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;                
            }
            if(vm.handle.orderDateEnd!=undefined && vm.handle.isLongStop!=undefined){
                console.log(1)
                if(vm.handle.orderDateEnd=='' && vm.handle.isLongStop ==false){
                  var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;   
                }else if(vm.handle.isLongStop ==true && vm.handle.orderDateEnd!==''){
                    var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停其中一项!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return; 
                }
            }
            vm.stopOrderSaving = true;
            if(vm.handle.orderDateEnd != undefined || $.trim(vm.handle.orderDateEnd) !=""){
                rest.stopOrderInTime(vm.handle).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var cancelAlert = $alert({
                            content: '订单已区间停订!',
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
                    vm.stopOrderSaving = false;
                 }); 
                return;
                
            }else{
                rest.stopOrder(vm.handle).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var cancelAlert = $alert({
                            content: '订单已停订!',
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
                    vm.stopOrderSaving = false;
                 }); 
            }
        }

        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }

        function closeModal() {
            $uibModalInstance.close();
        }

    }

    allContinueOrdersModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];

    function allContinueOrdersModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.allContinueSaving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {"status":'batch'};

        function save() {
            vm.allContinueSaving = true;
            vm.handle.orderNo = '';
            for(var i= 0 ;i<orderNo.length;i++){
                vm.handle.orderNo = vm.handle.orderNo + orderNo[i] + ','
            }
            rest.allContinueOrders(vm.handle).then(function(json){
                // vm.allContinueSaving = false;
                var result = json.type;
                if(result == 'success'){
                    var cancelAlert = $alert({
                        content: '所选订单已续订!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                }
             },function(json){
                vm.allContinueSaving = false;
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

    returnAllOrdersModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];

    function returnAllOrdersModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.returnAllOrderSaving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {};

        function save() {
            vm.returnAllOrderSaving = true;
            vm.handle.orderNo = '';
            if(vm.handle.orderDateStart == undefined || $.trim(vm.handle.orderDateStart) =="" ){
                vm.returnAllOrderSaving = false;
                var cancelAlert = $alert({
                        content: '请至少选择停订开始日期!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            if(vm.handle.orderDateEnd == undefined && vm.handle.isLongStop==undefined){
                vm.returnAllOrderSaving = false;
                var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;                
            }
            if(vm.handle.orderDateEnd!=undefined && vm.handle.isLongStop!=undefined){
                if(vm.handle.orderDateEnd=='' && vm.handle.isLongStop ==false){
                    vm.returnAllOrderSaving = false;
                  var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;   
                }else if(vm.handle.isLongStop ==true && vm.handle.orderDateEnd!==''){
                    vm.returnAllOrderSaving = false;
                    var cancelAlert = $alert({
                        content: '请填入停订截至日期或者选择长停其中一项!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return; 
                }
            }
            for(var i= 0 ;i<orderNo.length;i++){
                vm.handle.orderNo = vm.handle.orderNo + orderNo[i] + ','
            }
            rest.allStopOrders(vm.handle).then(function(json){
                // vm.returnAllOrderSaving = false;
                var result = json.type;
                if(result == 'success'){
                    var cancelAlert = $alert({
                        content: '所选订单已停订!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                }
             },function(json){
                vm.returnAllOrderSaving = false;
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

    resumeOrderModal.$inject = ['$scope', '$uibModalInstance', '$timeout', '$alert', 'orderNo', 'paymentMethod', 'rest'];

    function resumeOrderModal($scope, $uibModalInstance,$timeout, $alert,orderNo,paymentMethod,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date(),payMethod:paymentMethod};
        vm.order = {};
        vm.save = save;
        vm.resumeOrderSaving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};

        rest.calculateContinueOrder(vm.handle).then(function(json){
            vm.handle = json.data;
        });

        vm.calculate = (function () {
            var restfunc;
            var go = function(){
                if (vm.handle.goDays) {
                    rest.calculateContinueOrder(vm.handle).then(function(json){
                        vm.handle = json.data;
                    });
                }
            }    
            return function(){
                $timeout.cancel(restfunc);
                restfunc = $timeout(function(){
                             go();
                           },500);
                }
        }());

        function save() {
            vm.resumeOrderSaving = true;
            // if(vm.handle.goAmt == undefined || $.trim(vm.handle.goAmt) == ""){
            //     var cancelAlert = $alert({
            //             content: '请输入续费!',
            //             container: '#modal-alert'
            //         })
            //         cancelAlert.$promise.then(function () {
            //             cancelAlert.show();
            //         })
            //     return;
            // }
            if(!vm.handle.orderDateStart){
                vm.resumeOrderSaving = false;
                var cancelAlert = $alert({
                        content: '请选择续订时间!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            if(!vm.handle.goDays || vm.handle.goDays < 1 ){
                vm.resumeOrderSaving = false;
                var cancelAlert = $alert({
                        content: '请输入大于0的续订天数!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            console.log(vm.handle);
            rest.resumeOrder(vm.handle).then(function(json){
                // vm.resumeOrderSaving = false;
                var result = json.type;
                if(result == 'success'){
                    var cancelAlert = $alert({
                        content: '订单已续订!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                }
             },function(json){
                vm.resumeOrderSaving = false;
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

    resumeOrderFromStopModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orderNo', 'rest'];
	
    function resumeOrderFromStopModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.resumeOrderFromStopSaving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};

        function save() {
            vm.resumeOrderFromStopSaving = true;
            // if(vm.handle.goAmt == undefined || $.trim(vm.handle.goAmt) == ""){
            //     var cancelAlert = $alert({
            //             content: '请输入续费!',
            //             container: '#modal-alert'
            //         })
            //         cancelAlert.$promise.then(function () {
            //             cancelAlert.show();
            //         })
            //     return;
            // }
            if(vm.handle.orderDateStart == undefined || vm.handle.orderDateStart ==""){
                vm.resumeOrderFromStopSaving = false;
                var cancelAlert = $alert({
                        content: '请选择复订开始时间!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            rest.resumeOrderFromStop(vm.handle).then(function(json){
                // vm.resumeOrderFromStopSaving = false;
                var result = json.type;
                if(result == 'success'){
                    var cancelAlert = $alert({
                        content: '订单已复订!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    }).then(function(){
                        closeModal();
                    })
                }
             },function(json){
                vm.resumeOrderFromStopSaving = false;
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

    empChangeModal.$inject = ['$scope', '$uibModalInstance', '$alert', 'orders', 'rest'];

    function empChangeModal($scope, $uibModalInstance, $alert, orders, rest) {
        var vm = $scope;
        vm.change = {};
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.empChangeSaving = false;

        rest.getAllEmpByBranchNo('').then(function (json) {
            vm.emps = json.data;
        }, function (reject) {
            showAlert({
                title: reject.data.type,
                content: reject.data.msg,
                container: '#modal-alert'
            })
        })

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function save() {
            vm.empChangeSaving = true;
            if (!vm.change.empA) {
                vm.empChangeSaving = false;
                showAlert({
                    content: '请先选择送奶员！',
                    container: '#modal-alert'
                })
            }else{
                rest.updateOrderEmp({
                    orders:orders,
                    empNo: vm.change.empA
                }).then(function (json) {
                    // vm.empChangeSaving = false;
                    showAlert({
                        content: '替换成功！',
                        container: '#modal-alert'
                    }).then(function () {
                        closeModal();
                    })
                }, function function_name(reject) {
                    vm.empChangeSaving = false;
                    showAlert({
                        title: '替换失败',
                        content: reject.data.msg,
                        container: '#modal-alert'
                    })
                })
            }
        }

        function showAlert(opts) {
            var alert = $alert(opts)
            alert.$promise.then(function () {
                alert.show();
            })
            return alert.$promise;
        }
    }

    batchSearchByMpModal.$inject = ['$scope','$uibModalInstance','$alert'];

    function batchSearchByMpModal($scope, $uibModalInstance, $alert) {
        var vm = this;
        vm.cancelModal = cancelModal;
        vm.save = save;

        $scope.$watch('bsm.mpList', function (newVal) {
            vm.mpArr = parseOrder(newVal);
        })

        function parseOrder(str) {
            return str ? _.uniq(str.split('\n')) : [];
        }

        function save() {
            if (!vm.mpArr || vm.mpArr.length === 0) {
                var saveAlert = $alert({
                    content: "没有指定联系电话！",
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function() {
                    saveAlert.show();
                })
                return;
            }
            closeModal(vm.mpArr);
        }


        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal(arr) {
            $uibModalInstance.close(arr);
        }
    }

    backOrderModal.$inject = ['$uibModalInstance', '$alert', 'orderNo', 'restService'];

    function backOrderModal($uibModalInstance, $alert, orderNo, rest) {
        var vm = this;

        vm.returnReasons = [
            {"code":"10","text":"不在配送区域"},
            {"code":"20","text":"订单信息有误"},
            {"code":"30","text":"无法满足客户需求"},
            {"code":"40","text":"其他原因,填写备注"}
        ];
        vm.params = {"orderNo":orderNo,"retReason":"10"};

        vm.cancelModal = cancelModal;
        vm.save = save;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        function save() {
            if(vm.params.retReason === '40' && $.trim(vm.params.memoTxt) === '' ){
                var saveAlert = $alert({
                    content: '请填写备注！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            } else {
                rest.backUnBranchOrder(vm.params).then(function(json){
                    var result = json.type;
                    if(result === 'success'){
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

})();