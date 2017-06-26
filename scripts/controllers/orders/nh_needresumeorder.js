(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('needResumeOrderCtrl', needResumeOrderCtrl)  
      .controller('CancelOrderModal', CancelOrderModal)
      .controller('stopOrderModal', stopOrderModal)
      .controller('returnAllOrdersModal', returnAllOrdersModal)
      .controller('resumeOrderModal', resumeOrderModal)
      .controller('noResumeOrderModal', noResumeOrderModal)
      .controller('resumeOrderFromStopModal', resumeOrderFromStopModal)
      .controller('allContinueOrdersModal', allContinueOrdersModal)
      .controller('batchSearchByMpModal', batchSearchByMpModal);

	needResumeOrderCtrl.$inject = ['$rootScope','$state', '$timeout', '$stateParams','$scope','$uibModal', '$alert','restService'];  

	function needResumeOrderCtrl($rootScope, $state, $timeout, $stateParams, $scope, $uibModal,  $alert , rest) {

        var pvm = this; var vm = $scope;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        // vm.pageno = 1; // 初始化页码为1
        // vm.curPageno = $rootScope.getCurPage_Record();
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 50; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.search={};
        //导出待续订订单  liuyin
        vm.exportTable=function(){
        	  var params = {
                     orderDateStart:vm.search.orderDateStart,
                     orderDateEnd:vm.search.orderDateEnd,
                     empNo:vm.search.empNo,
                     paymentStat:vm.search.paymentStat
                 }
         rest.exportNeedResumeOrders(params).then(function (json) {
                var result = json.type;
                if(result == 'success'){
                  	rest.reportDeliverFile(json.data);
                 }
              })
          }
        
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

        if ($stateParams.csmPhone) {
            vm.search.milkmemberNo = $stateParams.csmPhone;
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
                
                $timeout(function () {
                    rest.searchReNeedOrdersByMp(params).then(function (json) {
                        vm.tbLoding = 0;
                        vm.content = json.data.list;
                        vm.total_count = json.data.total;
                    });
                }, 1000);

            } else {
                params = {
                    pageNum: pageno,
                    pageSize: vm.itemsPerPage,
                    orderDateStart:vm.search.orderDateStart,
                    orderDateEnd:vm.search.orderDateEnd,
                    empNo:vm.search.empNo,
                    paymentStat:vm.search.paymentStat
                }
                
                $timeout(function () {
                    rest.needResumeOrders(params).then(function (json) {
                        vm.tbLoding = 0;
                        vm.content = json.data.list;
                        vm.total_count = json.data.total;
                    });
                }, 1000);
            }
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

        vm.signFormat = function (sign) {
           if("10"==sign)return '在订';
           if("20"==sign)return '停订';
           if("30"==sign)return '退订';
        }

        vm.reloadTable = function(){
            vm.curPageno = 1;
        	vm.getData(vm.curPageno);
        }
        /*table-end*/
        vm.statuses = [{'code':'10','text':'在订'},{'code':'20','text':'停订'},{'code':'30','text':'退订'}];
        vm.payStatuses = [{'code':'10','text':'后付款'},{'code':'20','text':'先付款'}];
        /*产品列表*/
        // vm.getProductTxt = function(product){
        //     rest.getProductByCodeOrName(product).then(function(json){
        //       vm.Rproducts = json.data;   
             
        //     })
        // }

        rest.getAllMilkmanByBranchNo($rootScope.$storage.user.branchNo, 'milkMan').then(function (json) {
              vm.canSelectEmps = json.data;
        });

        vm.toOrderDetail = function(orderNo){
            // $rootScope.curPage_Record = vm.curPageno;
            // $state.go("newhope.orderDetail", {orderNo: orderNo});
            var url = $state.href('newhope.orderDetail', {orderNo: orderNo});
            window.open(url,'_blank');
        };

        vm.toOrderEdit = function(orderNo){
            // $rootScope.curPage_Record = vm.curPageno;
            // $state.go("newhope.orderEdit",{orderNo: orderNo});
            var url = $state.href('newhope.orderEdit', {orderNo: orderNo});
            window.open(url,'_blank');
        };

	    /////////modal区//////////
        /*订单取消*/
	    vm.cancelOrder = function(data) {
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

           /*订单不参与*/
        vm.noResumeOrder  = function(data,type){
             vm.handle = {"orderNo":data};
                var modalInst = $uibModal.open({
                templateUrl: 'noResumeOrderModal.html',
                controller: 'noResumeOrderModal',
                size: 'md',
                resolve: {
                     rest:rest
                }
                });
                modalInst.result.then(function(result) {
                      if("Y"===result){
                         rest.noResumeOrder(vm.handle).then(function(json){
                             // vm.saving = false;
                            var result = json.type;
                            if(result == 'success'){
                                var cancelAlert = $alert({
                                    content: '订单已成功不参与续订!',
                                    container: '#modal-alert'
                                })
                                cancelAlert.$promise.then(function () {
                                    cancelAlert.show();
                                     vm.getData(vm.curPageno);
                                })
                            }
                     },function(json){
                         vm.saving = false;
                            var saveAlert = $alert({
                            content: '操作失败！' + json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                     }); 
                      }
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
	}

    CancelOrderModal.$inject = ['$scope','$uibModalInstance','$alert','orderNo', 'rest'];

    function CancelOrderModal($scope, $uibModalInstance, $alert,orderNo,rest) {
        var vm = $scope;
        //默认值
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

    stopOrderModal.$inject = ['$scope','$uibModalInstance','$alert','orderNo', 'rest'];

    function stopOrderModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
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

    allContinueOrdersModal.$inject = ['$scope','$uibModalInstance','$alert','orderNo', 'rest'];

    function allContinueOrdersModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.saving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {"status":'batch'};

        function save() {
            vm.saving = true;
            vm.handle.orderNo = '';
            for(var i= 0 ;i<orderNo.length;i++){
                vm.handle.orderNo = vm.handle.orderNo + orderNo[i] + ','
            }
            rest.allContinueOrders(vm.handle).then(function(json){
                 // vm.saving = false;
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
                 vm.saving = false;
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

    returnAllOrdersModal.$inject = ['$scope','$uibModalInstance','$alert','orderNo', 'rest'];

    function returnAllOrdersModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.handle = {};

        function save() {
            vm.handle.orderNo = '';
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
            for(var i= 0 ;i<orderNo.length;i++){
                vm.handle.orderNo = vm.handle.orderNo + orderNo[i] + ','
            }
            rest.allStopOrders(vm.handle).then(function(json){
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
     noResumeOrderModal.$inject = ['$scope','$uibModalInstance','$timeout','$alert', 'rest'];
     function noResumeOrderModal($scope, $uibModalInstance,$timeout, $alert,rest) {
        var vm = $scope;
        vm.save = save;
        vm.saving = false;
        vm.cancelModal = cancelModal;

        function save() {
             vm.saving = true;
             closeModal("Y");
        }

        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }

        function closeModal(data) {
            $uibModalInstance.close(data);
        }
    }

    resumeOrderModal.$inject = ['$scope','$uibModalInstance','$timeout','$alert','orderNo', 'paymentMethod', 'rest'];

    function resumeOrderModal($scope, $uibModalInstance,$timeout, $alert,orderNo,paymentMethod,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date(),payMethod:paymentMethod};
        vm.order = {};
        vm.save = save;
        vm.saving = false;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};
        if(paymentMethod=="20"){
        	 vm.showOrhide=false;
        }else{
        	 vm.showOrhide=true;
        }
        
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
             vm.saving = true;
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
                 vm.saving = false;
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
                vm.saving = false;
                var cancelAlert = $alert({
                        content: '请输入大于0的续订天数!',
                        container: '#modal-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                return;
            }
            rest.resumeOrder(vm.handle).then(function(json){
                 // vm.saving = false;
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
                 vm.saving = false;
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

    resumeOrderFromStopModal.$inject = ['$scope','$uibModalInstance','$alert','orderNo', 'rest'];
	
    function resumeOrderFromStopModal($scope, $uibModalInstance, $alert,orderNo,rest) {

        var vm = $scope;
        //默认值
        vm.defaultValue={date:new Date()};
        vm.order = {};
        vm.save = save;
        vm.cancelModal = cancelModal;
        vm.handle = {"orderNo":orderNo};

        function save() {
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

})();