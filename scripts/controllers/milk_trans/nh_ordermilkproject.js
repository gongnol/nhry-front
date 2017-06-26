(function() {
	'use strict';
	angular
	  .module('newhope')
    .controller('milkProjectCtrl', milkProjectCtrl)
    .controller('editPlansModal', editPlansModal)
    .controller('editOrgPlansModal',editOrgPlansModal)
    .controller('editPromotionsModal', editPromotionsModal);
    
  milkProjectCtrl.$inject = ['$locale','$state','$stateParams','$scope','$alert','$uibModal','restService'];
	function milkProjectCtrl($locale,$state,$stateParams, $scope, $alert,$uibModal, rest) {

        var vm = $scope;
        vm.chargebillDeling = false;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 50; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.isOrgOrder = true;
        vm.search = {};
        vm.branch = true;

        vm.getData = function(pageno){ 
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                orderNo:vm.search.orderNo
            }

            rest.getDaliyPlans(params).then(function (json) {
                // if(json.data.list.length<=0){
                //     var saveAlert = $alert({
                //             content: '没有找到此订单的日计划!',
                //             container: '#body-alert'
                //         })
                //         saveAlert.$promise.then(function () {
                //             saveAlert.show();
                //         })
                // }
                vm.tbLoding = 0;
                vm.content = json.data.list;
                
                vm.total_count = json.data.total;
            });
        };

        if ($stateParams.orderNo) {
            vm.search.orderNo = $stateParams.orderNo;
            getOrderInfo();
            vm.getData(vm.pageno);
        }
        
        // vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 
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
        vm.statusFormat = function(status){
            if(status=='10')return '早上配送';
            if(status=='20')return '下午配送';
        } 
        vm.statusFormat2 = function(status){
            if(status=='10')return '生成';
            if(status=='20')return '确认';
            if(status=='30')return '已停订';
            if(status=='40')return '已送达';
        }
        vm.reloadTable = function(){
            vm.curPageno = 1;
            getOrderInfo();
            vm.getData(vm.pageno);
        }

        vm.delChargebill = function () {
            vm.chargebillDeling = true;
            rest.delReceipt(vm.receiptNo).then(function (json) {
                vm.chargebillDeling = false;
                vm.haveReceiptOrder = false;
                var saveAlert = $alert({
                    content: '删除成功！',
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            },function(json){
                vm.chargebillDeling = false;
                var saveAlert = $alert({
                    content: '删除失败！' + json.data.msg,
                    container: '#modal-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            })
        }
        
        /*订单退回*/
        vm.editPlan  = function(orderNo,itemNo,price,unit,planItemNo,matnr,matnrTxt,qty,reachTimeType){
            var edithtml;
            var editCtrl;
            if(vm.orderDetail.order.preorderSource=='70'){
                edithtml = 'editOrgPlans.html';
                editCtrl = 'editOrgPlansModal';
            }else{
               edithtml = 'editPlans.html';
                editCtrl = 'editPlansModal';
            }
            var modalInst = $uibModal.open({
                templateUrl: edithtml,
                controller: editCtrl,
                size: 'md',
                resolve: {
                    orderNo: function() {
                        return orderNo;
                    },
                    planItemNo: function() {
                        return planItemNo;
                    },
                    matnr: function() {
                        return matnr;
                    },
                    matnrTxt: function() {
                        return matnrTxt;
                    },
                    qty: function() {
                        return qty;
                    }, 
                    reachTimeType: function() {
                        return reachTimeType;
                    }, 
                    itemNo: function() {
                        return itemNo;
                    },
                    price: function() {
                        return price;
                    },
                    unit: function() {
                        return unit;
                    },
                    pScope: vm,
                    rest: rest
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        vm.stopPlan = function(orderNo,planItemNo,itemNo){

            angular.element('#stopbutton'+planItemNo).attr('disabled',true);

            var params = {orderCode:orderNo,
                    entries:[
                     { "planItemNo":planItemNo,
                       "itemNo":itemNo,
                       "status":'30'
                     }
                    ]
            };
            rest.saveDaliyPlans(params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '停订成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            vm.getData(vm.curPageno);
                        })
                    }
            },function(json){
                    var saveAlert = $alert({
                            content: '停订失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
            });
        }

         vm.backAmt = function(orderNo,planItemNo,itemNo){

          if(confirm("确定退款？")){
             angular.element('#backAmtButten'+planItemNo).attr('disabled',true);

            var params = {orderCode:orderNo,
                    entries:[
                     { "planItemNo":planItemNo,
                       "itemNo":itemNo
                     }
                    ]
            };
            rest.daliyBackAmt(params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '退款成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            vm.getData(vm.curPageno);
                        })
                    }
            },function(json){
                    var saveAlert = $alert({
                            content: '退款失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
                  angular.element('#backAmtButten'+planItemNo).attr('disabled',false);
            });

          }
           
        }

        

        vm.recoverPlan = function (item){
            angular.element('#recoverbutton'+item.planItemNo).attr('disabled',true);

            rest.recoverDaliyPlans(item).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '恢复成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            vm.getData(vm.curPageno);
                        })
                    }
            },function(json){
                    var saveAlert = $alert({
                            content: '恢复失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
            });
        }

        vm.editPromotion = function () {
            var modalInst = $uibModal.open({
                templateUrl: 'editPromotionsModal.html',
                controller: 'editPromotionsModal',
                controllerAs: 'epm',
                size: 'lg',
                resolve: {
                    proms: function() {
                        return vm.content.filter(function (ele) {
                            if (!ele.price && ele.status === '10') {
                                return true;
                            } 
                            return false;
                        });
                    },
                    orderNo: function () {
                        return vm.search.orderNo;
                    }
                }
            });
            modalInst.result.then(function() {
                vm.getData(vm.curPageno);
            })
        }

        function getOrderInfo() {
            // 获取订单详情信息
            rest.orderDetail(vm.search.orderNo).then(function(json) {
                if (json.type == 'success') {
                    vm.orderDetail = json.data;
                    if(vm.orderDetail.order.preorderSource=='70'){
                        vm.isOrgOrder=false;
                       
                        rest.getCurUser().then(function(json) {
                            vm.curUser = json.data;
                            if (json.data.branchNo != undefined) {
                                vm.branch = false;
                            }

                        })
                    }
                    json.data.entries.every(function (ele) {
                        if (ele.promotion) {
                            vm.havePromotions = true;
                            return false;
                        }
                        return true;
                    })
                }
            });
            // 获取订单收款单信息
            rest.getRecBillByOrderNo(vm.search.orderNo).then(function (json) {
                if(json.data && json.data.status === '10'){
                    vm.receiptNo = json.data.receiptNo;
                    vm.haveReceiptOrder = true;
                }else{
                    vm.haveReceiptOrder = false;
                }
            })
        }

  }

  editPlansModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'planItemNo', 'matnr', 'matnrTxt', 'qty', 'reachTimeType', 'itemNo', 'price', 'unit', 'pScope', 'rest'];

  function editPlansModal($scope, $state, $alert, $uibModalInstance, 
    orderNo,planItemNo,matnr,matnrTxt,qty,reachTimeType,itemNo,price,unit,
    pScope, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.reachTimeType = {data:[
          {code: '10' , text:"上午配送"},
          {code: '20' , text:"下午配送"}]
        };

        /*产品列表*/
        
        rest.getProductByCodeOrName("").then(function(json){
          vm.Rproducts = json.data;   
         
        })
        

        vm.params = {orderCode:orderNo,
                    entries:[
                     { "planItemNo":planItemNo,
                       "itemNo":itemNo,
                       "matnr":matnr,
                       "matnrTxt":matnrTxt,
                       "price":price,
                       "unit":unit,
                       "qty":qty,
                       "reachTimeType":reachTimeType 
                     }
                    ]
        };

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            angular.element('#saveButton').attr('disabled',true);

            rest.saveDaliyPlans(vm.params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '修改成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
            },function(json){
                angular.element('#saveButton').attr('disabled',false);
                var saveAlert = $alert({
                            content: '修改失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
            });
        }

    }
  editOrgPlansModal.$inject = ['$scope', '$state', '$alert', '$uibModalInstance', 'orderNo', 'planItemNo', 'matnr', 'matnrTxt', 'qty', 'reachTimeType', 'itemNo', 'price', 'unit', 'pScope', 'rest'];

  function editOrgPlansModal($scope, $state, $alert, $uibModalInstance, 
    orderNo,planItemNo,matnr,matnrTxt,qty,reachTimeType,itemNo,price,unit,
    pScope, rest) {

        var vm = $scope;
        vm.cancelModal = cancelModal;
        vm.save = save;
        vm.isold = 'N';
        vm.priceAgree={};
        vm.reachTimeType = {data:[
          {code: '10' , text:"上午配送"},
          {code: '20' , text:"下午配送"}]
        };

        /*产品列表*/
        var params = {
            orgId:pScope.orderDetail.order.onlineSourceType,
            orderDate:pScope.orderDetail.order.orderDate,
            status:'Y',
            isShow:'Y'
        }
        rest.selectOrgPriceMatnrList(params).then(function(json){
          vm.Rproducts = json.data;   
         
        })
        

        vm.params = {orderCode:orderNo,
                    entries:[
                     { "planItemNo":planItemNo,
                       "itemNo":itemNo,
                       "matnr":matnr,
                       "matnrTxt":matnrTxt,
                       "price":price,
                       "unit":unit,
                       "qty":qty,
                       "reachTimeType":reachTimeType 
                     }
                    ]
        };

        function cancelModal() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }

        /*保存按钮*/
        function save() {
            angular.element('#saveButton').attr('disabled',true);
            rest.saveDaliyPlans(vm.params).then(function(json){
                    var result = json.type;
                    if(result == 'success'){
                        var saveAlert = $alert({
                            content: '修改成功！',
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        }).then(function(){
                            closeModal();
                        })
                    }
            },function(json){
                angular.element('#saveButton').attr('disabled',false);
                var saveAlert = $alert({
                            content: '修改失败！'+json.data.msg,
                            container: '#modal-alert'
                        })
                        saveAlert.$promise.then(function () {
                            saveAlert.show();
                        })
            });
        }

    }
	
   editPromotionsModal.$inject = ['$alert', '$uibModalInstance', 'proms', 'orderNo', 'restService'];

   function editPromotionsModal($alert, $uibModalInstance, proms, orderNo, rest) {
        var vm = this;

        proms.forEach(function (ele) {
            ele.dispDateStr = ele.dispDate.nh_formatDate();
        });

        vm.promotions = proms;
        vm.timeTypes = [
            {code: '10' , text:"上午配送"}, 
            {code: '20' , text:"下午配送"}
        ];

        vm.save = function () {
            var params = {
                orderCode: orderNo,
                entries: vm.promotions.map(function (ele) {
                    return {
                        itemNo: ele.itemNo,
                        planItemNo: ele.planItemNo,
                        orderNo: ele.orderNo,
                        reachTimeType: ele.reachTimeType,
                        dispDateStr: ele.dispDateStr
                    }
                })
            }

            rest.uptDispDateProm(params).then(function (json) {
                if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '赠品配送修改成功！',
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
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
            })
        }

        vm.cancelModal = function() {
            $uibModalInstance.dismiss();
        }

        function closeModal() {
            $uibModalInstance.close();
        }
   }
})();