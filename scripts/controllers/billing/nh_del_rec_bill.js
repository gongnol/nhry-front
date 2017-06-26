/**
 * @ngdoc Controller
 * @name nh_consumer_bill
 *
 * 订户结算列表控制器
 */
(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('DelRecBillsCtrl', DelRecBillsCtrl)
        .controller('ChargeReceiptModalCtrl', ChargeReceiptModalCtrl)
        .controller('ChaergerSelectCtrl', ChaergerSelectCtrl)
          .controller('OffSetModalCtrl', OffSetModalCtrl)
        .controller('CsmChargeModalCtrl', CsmChargeModalCtrl);


    DelRecBillsCtrl.$inject = ['$rootScope','$window','$scope', '$state', '$resource','$alert',  '$uibModal', 'restService','nhCommonUtil'];

    function DelRecBillsCtrl($rootScope,$window,$scope, $state, $resource,  $alert,$uibModal, rest,nhCommonUtil) {

        var vm = this; 
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        $scope.orderNos = [];
       $scope.search = {};
       $scope.search.status = '10';
       $scope.search.orderStartDate = nhCommonUtil.offsetMon(-2);
       $scope.batchCharging1 = false;
       $scope.batchCharging3 = false;
       $scope.batchCharging4 = false;
       $scope.batchCharging5 = false;

        $scope.paymentmethods = [
            {"code":"10","label":"后付款"}
            //{"code":"10","label":"后付款"},
            //{"code":"20","label":"预付款"}
        ];

        vm.getData = function(pageno){ 
            $scope.allChFlag = false;
            $scope.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            //alert();
            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                status: '10',//$scope.search.status,//收款状态,10:后付款,20:先付款
                paymentmethod : '10',//$scope.search.paymentmethod,//收款方式,10:未收款,20:已收款
                empNo: $scope.search.emp,
                search:$scope.search.fuzzySearch,
                orderStartDate: $scope.search.orderStartDate,
                orderEndDate: $scope.search.orderEndDate
             
            }
            //console.log(JSON.stringify(params));
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            rest.getCustSearchForRecBill(params).then(function (json) {
                //console.log(JSON.stringify(json));
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };

        $scope.fuzzySearch= function (e) {
            if (!e || e.keyCode == 13) {
              vm.curPageno = 1;
              vm.getData(vm.curPageno); 
            }
        }
        rest.getAllEmpByBranchNo("").then(function (json) {
              $scope.canSelectEmps = json.data;
        });
        rest.getAllMilkmanByBranchNo('','milkMan').then(function(json){
              $scope.emps = json.data;   
        });


         $scope.doDelRecBills= function () {
             //console.log($scope.checkboxArrs);
             if($scope.checkboxArrs==undefined || ''==$scope.checkboxArrs){
                    var cancelAlert = $alert({
                        content: '请勾选需要删除收款单的订单编号!',
                        container: '#body-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    return;
             }else {
              // var total_count = 0.00;
               var orderNos = [];
                $scope.checkboxArrs.forEach(function (item) {
                    //console.log(item);
                    var entry = item.split(',');
                        //total_count = nhCommonUtil.add(total_count,parseFloat(entry[1]));
                        orderNos.push(entry[0]);
                 });
                 console.log(orderNos);
                 if(confirm("确定删除吗?")){
                       $scope.batchCharging1 = true;
                       rest.delRecBills(orderNos).then(function (json) {
                        if(json.type=='success'){
                            $scope.batchCharging1 = false;
                            var cancelAlert = $alert({
                                content: '删除收款单成功',
                                container: '#body-alert'
                                //duration: false
                            })
                            cancelAlert.$promise.then(function () {
                                cancelAlert.show();
                            }).then(function(){
                                vm.getData(vm.curPageno); 
                            })

                        }
                    },function(json){
                        $scope.batchCharging1 = false;
                         var cancelAlert = $alert({
                                  content: '删除收款单失败！' + json.data.msg,
                                container: '#body-alert'
                            })
                            cancelAlert.$promise.then(function () {
                                cancelAlert.show();
                            })
                       
                    });
                  }
             
           }
        }



         rest.branchSearch().then(function(json){
              $scope.branchs = json.data;   
        });
        vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 

        $scope.status = [
            {
                label: '未收',
                code: '10'
            }
            //{
            //    label: '未收',
            //    code: '10'
            //}, {
            //    label: '已收',
            //    code: '20'
            //}
        ];
    
        /*******************查询过滤********************/
        $scope.doSearch = function(){
            vm.curPageno = vm.pageno;
            vm.getData(vm.pageno);
        }

        
        $scope.dateFormat = function (dateStr) {
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

        /*******************收款*******************/

         /*******************冲销*******************/

        /*******************收款单********************/
          /*******************查看订单********************/

    }

    ChaergerSelectCtrl.$inject = ['$scope','$alert','$uibModalInstance', 'restService', 'nhCommonUtil'];
    function ChaergerSelectCtrl($scope, $alert,$uibModalInstance,restService, nhCommonUtil){
            var vm = $scope;
            vm.select = {};
            vm.batchCharging2 = false;
             vm.cancelModal = cancelModal;
             restService.getAllMilkmanByBranchNo().then(function (json) {
                  vm.canSelectEmps = json.data;
             });

             vm.batchCollect = function(){
                    if(vm.select.emp == null){
                            var saveAlert = $alert({
                            content: '收款人必选 不能为空',
                            container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                            return;
                    }

                    var params = {
                        "empNo" : vm.select.emp,
                        "orderStartDate":vm.select.orderStartDate,
                        "orderEndDate":vm.select.orderEndDate
                    }
                    var total_count = 0.0;
                    vm.batchCharging2 = true;
                    restService.cacularTotalBeforBatch(params).then(function (json) {
                            if(json.type=='success'){
                               total_count = json.data;
                               if(confirm("一共需要收取钱数为  "+total_count+"  元！确定收取吗?")){
                                    restService.custBatchCollect(params).then(function (json) {
                                        if(json.type=='success'){
                                            vm.batchCharging2 = false;
                                            closeModal(json.data);
                                        }
                                    },function(json){
                                        vm.batchCharging2 = false;
                                        var saveAlert = $alert({
                                            content: '付款失败！' + json.data.msg,
                                            container: '#modal-alert'
                                        })
                                        saveAlert.$promise.then(function () {
                                            saveAlert.show();
                                        })
                                    });
                                } else {
                                    vm.batchCharging2 = false;
                                }
                            }
                        },function(json){
                            vm.batchCharging2 = false;
                            var saveAlert = $alert({
                                content: '付款失败！' + json.data.msg,
                                container: '#modal-alert'
                            })
                            saveAlert.$promise.then(function () {
                                saveAlert.show();
                            })
                    });

             }
            function cancelModal() {
                $uibModalInstance.dismiss();
            }
            function closeModal(data) {
                $uibModalInstance.close(data);
            }
    }
    CsmChargeModalCtrl.$inject = ['$scope','$alert','$uibModalInstance', 'payMentItem','restService', 'nhCommonUtil'];
   function CsmChargeModalCtrl($scope, $alert,$uibModalInstance,payMentItem,restService, nhCommonUtil) {
        var vm = $scope;
        vm.charging = false;
        vm.charge = {};
        vm.order = payMentItem;
        vm.select = {}
        vm.paymentTypes=[];
        vm.canSelectEmps = [];
        vm.orderDetail = {};
        vm.paymented = false;
        vm.pay = {};
        restService.codeMap("1010").then(function (json) {
             vm.paymentTypes  = json.data;
             vm.select.paymentType = "10";
        });

        restService.getAllMilkmanByBranchNo().then(function (json) {
              vm.canSelectEmps = json.data;
        });
        restService.orderDetail(vm.order.orderNo).then(function(json){
                 var result = json.type;
                if(result == 'success'){
                    vm.orderDetail = json.data;
                     vm.select.emp = json.data.order.empNo;
                    //查看收款单是否生成
                    restService.createRecBillByOrderNo(vm.order.orderNo).then(function (json) {
                        if(json.data !=null && json.data!=""){
                                if(json.data.status == '20'){
                                    vm.paymented = true;
                                    vm.pay=json.data;
                                    restService.dicItem('1010',json.data.paymentType).then(function (json) {
                                         vm.pay.paymentType=json.data.itemName;
                                    });
                                    
                                }
                                vm.accAmt = json.data.accAmt;
                                vm.custAcctAmt = json.data.custAccAmt;
                                //var preAcctAmt = nhCommonUtil.sub(vm.orderDetail.order.initAmt,vm.custAcctAmt);
                                 vm.preAcctAmt = json.data.suppAmt;
                                 vm.discountAmt = json.data.discountAmt;
                        }else{
                            vm.accAmt = null;
                             vm.custAcctAmt = vm.orderDetail.account.acctAmt;
                            var preAcctAmt = nhCommonUtil.sub(vm.orderDetail.order.initAmt, vm.orderDetail.account.acctAmt);
                             vm.preAcctAmt = preAcctAmt > 0 ? preAcctAmt : 0;
                        }
                    });
                  
                }
        },function(json){
            var saveAlert = $alert({
                content: '订单信息加载失败！' + json.data.msg,
                container: '#modal-alert'
            })
            saveAlert.$promise.then(function () {
                saveAlert.show();
            })
         });

      

       


        vm.cancelModal = cancelModal;
        vm.charge = function(){
            var params={
              "orderNo": vm.order.orderNo,
              "amt": vm.select.amt,
              "empNo":vm.select.emp,
              "paymentType":  vm.select.paymentType,
              "remark": vm.select.remark
            }
             if(vm.select.amt == null){
                 var saveAlert = $alert({
                content: '请填写付款金额！谢谢',
                container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })   
                 return;
            }

            if(vm.select.paymentType == null){
                 var saveAlert = $alert({
                content: '请选择付款方式！谢谢',
                container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })   
                return;
            }

           

            if(vm.select.emp == null){
                 var saveAlert = $alert({
                content: '收款人不能为空！谢谢',
                container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })   
                 return;
            }

            vm.charging = true;
            params.entries = vm.orderDetail.entries;//订单行的起始日期修改

            restService.customerPayment(params).then(function (json) {
                if(json.type='success'){
                        closeModal();
                }
            },function(json){
                vm.charging = false;
                var saveAlert = $alert({
                    content: '付款失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });

        }
        function cancelModal() {
            $uibModalInstance.dismiss();
        }
        function closeModal() {
            $uibModalInstance.close();
        }
    }
    ChargeReceiptModalCtrl.$inject = ['$window','$scope','$alert','$uibModalInstance', 'orderNo','restService', 'nhCommonUtil'];
    function ChargeReceiptModalCtrl($window,$scope,$alert,$uibModalInstance,orderNo,restService,nhCommonUtil) {
        var vm = $scope;
        vm.totalNum = 0;
        vm.haveReceiptOrder = false;
        vm.receiptNo = null;
        vm.cancelModal = cancelModal;
        vm.deling = false;
        restService.queryCollectByOrderNo(orderNo).then(function (json) {
           // console.log(JSON.stringify(json));
            vm.order  =json.data.order;
            vm.entries = json.data.entries;
            vm.address = json.data.address;
            vm.totalPrice = json.data.totalPrice;
            vm.branch = json.data.branch;
            vm.custAccAmt = json.data.custAccAmt;
            vm.suppAmt = json.data.suppAmt;
            var preAcctAmt = nhCommonUtil.sub(vm.order.initAmt,vm.custAccAmt);
            vm.suppAmt = json.data.suppAmt;
            vm.discountAmt = json.data.discountAmt;
            vm.preAcctAmt = preAcctAmt > 0 ? preAcctAmt : 0;
        },function(json){
        }).then(function(json){
                restService.getRecBillByOrderNo(orderNo).then(function (json) {
                        if(json.data!=null && json.data!=""){
                            vm.receiptNo = json.data.receiptNo;
                            vm.haveReceiptOrder = true;
                        }else{
                             vm.haveReceiptOrder = false;
                        }
                })
        });


        vm.delReceipt = function(){

                vm.deling = true;
                restService.delReceipt(vm.receiptNo).then(function (json) {
                       vm.deling = false;
                       vm.haveReceiptOrder = false;
                        var saveAlert = $alert({
                            content: '删除成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })

                },function(json){
                        vm.deling = false;
                        var saveAlert = $alert({
                            content: '删除失败！' + json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                })
        }
        vm.print =function(orderNo){
            var params = {
                orderNo:orderNo,
                paymentmethod:vm.order.paymentmethod
            }
            $scope.batchCharging5 = true;
            restService.reportCollectByEmp(params).then(function(json){
                    if (json.data) {
                        restService.reportDeliverFile(json.data);
                    }
                    $scope.batchCharging5 = false;
                   
                }, function (reject) {
                    var cancelAlert = $alert({
                        content: reject.data.msg,
                        container: '#body-alert'
                    })
                    cancelAlert.$promise.then(function () {
                        cancelAlert.show();
                    })
                    $scope.batchCharging3 = false;
                })  
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
    
        var tableUrl = 'scripts/api/consumerReceipt.json';
       

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }
    OffSetModalCtrl.$inject = ['$scope','$alert','$uibModalInstance', 'payMentItem','restService', 'nhCommonUtil'];
    function OffSetModalCtrl($scope, $alert,$uibModalInstance,payMentItem,restService, nhCommonUtil) {
        var vm = $scope;
        vm.charging = false;
        vm.order = payMentItem;
        vm.select = {}
        vm.paymentTypes=[];
        vm.canSelectEmps = [];
        vm.orderDetail = {};
        vm.paymented = false;
        vm.pay = {};
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
        restService.orderDetail(vm.order.orderNo).then(function(json){
                 var result = json.type;
                if(result == 'success'){
                    vm.orderDetail = json.data;
                     vm.select.emp = json.data.order.empNo;
                    //查看收款单是否生成
                    restService.createRecBillByOrderNo(vm.order.orderNo).then(function (json) {
                        if(json.data !=null && json.data!=""){
                                if(json.data.status == '20'){
                                    vm.pay=json.data;
                                }
                                vm.accAmt = json.data.accAmt;
                                vm.custAcctAmt = json.data.custAccAmt;
                                var preAcctAmt = nhCommonUtil.sub(vm.orderDetail.order.initAmt,vm.custAcctAmt);
                                 vm.preAcctAmt = preAcctAmt > 0 ? preAcctAmt : 0;
                                 restService.dicItem('1010',json.data.paymentType).then(function (json) {
                                        vm.pay.paymentType=json.data.itemName;
                                });
                        }else{
                            vm.accAmt = null;
                             vm.custAcctAmt = vm.orderDetail.account.acctAmt;
                            var preAcctAmt = nhCommonUtil.sub(vm.orderDetail.order.initAmt, vm.orderDetail.account.acctAmt);
                             vm.preAcctAmt = preAcctAmt > 0 ? preAcctAmt : 0;
                        }
                    });
                  
                }
        },function(json){
            var saveAlert = $alert({
                content: '订单信息加载失败！' + json.data.msg,
                container: '#modal-alert'
            })
            saveAlert.$promise.then(function () {
                saveAlert.show();
            })
         });
        vm.offset = function(){
             restService.customerOffset(vm.pay.receiptNo).then(function (json) {
                    if(json.type='success'){
                        closeModal();
                    }
            },function(json){
                vm.charging = false;
                var saveAlert = $alert({
                    content: '冲销失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        }      
        
        vm.cancelModal = cancelModal;
              function cancelModal() {
            $uibModalInstance.dismiss();
        }
        function closeModal() {
            $uibModalInstance.close();
        }
    }

})();