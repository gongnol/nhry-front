// code style: https://github.com/johnpapa/angular-styleguide 

(function() {
    'use strict';
    angular
      .module('newhope')
      .controller('SaleOrderCtrl', SaleOrderCtrl )
      .controller('DetailSalOrderModalCtrl',DetailSalOrderModalCtrl)
      .controller('DetailModalCtrl', DetailModalCtrl)
      .controller('DetailEmpModalCtrl',DetailEmpModalCtrl);
      
    SaleOrderCtrl.$inject = ['$state', '$alert','$scope','$uibModal','restService'];

    function SaleOrderCtrl($state, $alert, $scope, $uibModal, rest) {
        var vm = $scope;
        vm.search={};
        vm.orderCreating = false;
        vm.isEmpSend = false;
        vm.selfBranch = true;

        rest.getCustBranchInfo().then(function(json){
             if(json.data.branchGroup == '02'){
                vm.selfBranch = false;
             }
        })
        vm.preorderSource = function (code) {
            if("30" === code )return '奶站';
            if("40" === code)return '电商';
            if("70" === code)return '机构';
            if("90" === code)return 'VIP';
            if("YE" === code )return '年卡';
            if("EM" === code)return '送奶员';
            
        }

        vm.search.requiredDate = new Date();
        vm.search.createDate = new Date();
        //设置送奶员有销售订单显示为true
        rest.isEmpSendMode().then(function(json){
          if(json.type=='success'){
              if(json.data == true){
                vm.isEmpSend = true;
              }
          }
        })        
        vm.query = function(){
        rest.sumSalOrder({orderDate:vm.search.requiredDate}).then(function(json) {
          if (json.type == 'success') {
            vm.sumSal = json.data;
          }
        })
        rest.sumGiOrder({orderDate:vm.search.requiredDate}).then(function(json) {
          if (json.type == 'success') {
            vm.giSal = json.data;
          }
        })
          rest.getSaleOrderByQueryDate(vm.search.requiredDate).then(function(json){
              if(json.type=='success'){
                  if(json.data == null || json.data == ""){
                        var saveAlert = $alert({
                          content: "今天的销售订单不存在",
                          container: '#body-alert'
                        })
                           saveAlert.$promise.then(function () {
                          saveAlert.show();
                      })
                  }
                  vm.nhmilks = json.data;
              }
             
          },function(json){
                var saveAlert = $alert({
                    content: json.data.msg,
                    container: '#body-alert'
                  })
                     saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
 
          })

        }
       /****************************生成当天的销售订单***************************************/
        vm.createBySelf = function(){
               //生成当天的要货计划
          vm.orderCreating = true;
          rest.creaSalOrderOfSelftBranch().then(function(json){
              if(json.type="success"){
                var saveAlert = $alert({
                    content: '创建成功',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                 vm.orderCreating = false;
                 vm.nhmilks = json.data;
                 vm.nhmilks.forEach(function (item) {
                    if(item.voucherNo == "" || item.voucherNo==null){
                            var saveAlert = $alert({
                              content: "有销售订单没有获取到销售订单号，建议再次生成",
                              container: '#body-alert'
                              })
                             saveAlert.$promise.then(function () {
                                  saveAlert.show();
                             })
                    }
                 });
              }
             
          },function(json){
                var saveAlert = $alert({
                    content: json.data.msg,
                    container: '#body-alert'
                })
               saveAlert.$promise.then(function () {
                    saveAlert.show();
               })
            vm.orderCreating = false;
          })

        }

            /****************************发送指定日期的送奶员的销售订单***************************************/
        vm.detailSalOrder = function(orderNo){
            if(vm.sumSal!=undefined && vm.giSal!=undefined &&vm.sumSal!=vm.giSal){
              var modalInst = $uibModal.open({
                      templateUrl: 'detailSalOrder.html',
                      controller: 'DetailSalOrderModalCtrl',
                      size: 'lg',
                      resolve: {
                       detailItem: function() {
                               return  {
                                "orderDate":vm.search.requiredDate,
                                "sumSal":vm.sumSal,
                                "giSal":vm.giSal

                         };
                        }
                      }
                   });              
            }else if(vm.sumSal!=undefined && vm.giSal!=undefined&&vm.sumSal==vm.giSal){
              rest.batchSendSalOrderByDate({orderDate:vm.search.createDate}).then(function(json){
                            if(json.type="success"){
                              var saveAlert = $alert({
                                  content: '发送成功',
                                  container: '#body-alert'
                              })
                              saveAlert.$promise.then(function () {
                                  saveAlert.show();
                              })
                              vm.orderCreating = false;
                               vm.nhmilks = json.data;
                            }
                           
                        },function(json){
                          var saveAlert = $alert({
                                  content: json.data.msg,
                                  container: '#body-alert'
                              })
                              saveAlert.$promise.then(function () {
                                  saveAlert.show();
                            })
                          vm.orderCreating = false;
                        })

                      }                 
            }
                
             
       
           /****************************生成指定日期的销售订单***************************************/
        vm.createBySelfAndDate = function(){
               //生成当天的要货计划
          vm.orderCreating = true;
        rest.sumSalOrder({orderDate:vm.search.createDate}).then(function(json) {
          if (json.type == 'success') {
            vm.sumSal = json.data;
          }
        })
        rest.sumGiOrder({orderDate:vm.search.createDate}).then(function(json) {
          if (json.type == 'success') {
            vm.giSal = json.data;
          }
        })
          rest.creaSalOrderOfSelftBranchByDate(vm.search.createDate).then(function(json){
              if(json.type="success"){
                var saveAlert = $alert({
                    content: '创建成功',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                vm.orderCreating = false;
                 vm.nhmilks = json.data;
              }
             
          },function(json){
            var saveAlert = $alert({
                    content: json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
              })
            vm.orderCreating = false;
          })

        }

        /*vm.createByDealer = function(){
                 //生成当天的要货计划
            vm.orderCreating = true;
            rest.creaSalOrderOfDealerBranch().then(function(json){
              if(json.type="success"){
                 vm.nhmilks = json.data;
              }
               
            },function(json){
              alert(json.data.msg)
            })

        }*/



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

        vm.detail = function(orderNo){
          var modalInst = $uibModal.open({
              templateUrl: 'detailModel.html',
              controller: 'DetailModalCtrl',
              size: 'lg',
              resolve: {
               detailItem: function() {
                       return  orderNo;
                 }
              
              }
           });
       }
       vm.detailEmp = function(orderNo){
        var modalInst = $uibModal.open({
              templateUrl: 'detailEmpModel.html',
              controller: 'DetailEmpModalCtrl',
              size: 'lg',
              resolve: {
               detailItem: function() {
                       return  orderNo;
                 }
              
              }
           });
       }
       
    }

    DetailModalCtrl.$inject = ['$scope', '$uibModalInstance', 'detailItem', 'restService'];

    function DetailModalCtrl($scope, $uibModalInstance, detailItem, restService) {
          var vm = $scope;
            vm.orderNo = detailItem;
            vm.cancelModal = cancelModal;
            restService.getSaleOrderDetailByOrderNo(vm.orderNo).then(function(json){
                    vm.items = json.data;   
                    vm.totalQty = getTotalQty(vm.items);
            })
          function cancelModal() {
              $uibModalInstance.dismiss();
          }
          function getTotalQty(arr) {
            var sum = 0;
            for (var i = 0, len = arr.length; i < len; i++) {
              sum += arr[i].qty;
            }
            return sum;
          }

    }

     DetailEmpModalCtrl.$inject = ['$scope', '$alert','$uibModalInstance', 'detailItem', 'restService'];

    function DetailEmpModalCtrl($scope, $alert,$uibModalInstance, detailItem, restService) {
          var vm = $scope;
            vm.orderNo = detailItem;
            vm.cancelModal = cancelModal;
            restService.getSaleOrderDetailByOrderNo(vm.orderNo).then(function(json){
                    vm.items = json.data;   
                    vm.totalQty = getTotalQty(vm.items);
            })
          function cancelModal() {
              $uibModalInstance.dismiss();
          }
          function getTotalQty(arr) {
            var sum = 0;
            for (var i = 0, len = arr.length; i < len; i++) {
              sum += arr[i].qty;
            }
            return sum;
          }
          vm.qtyChange = function(){
            vm.totalQty = getTotalQty(vm.items);
          }
          vm.updateSalOrderItems = function(){
            
            var params = {
              entries:vm.items
            }
            restService.updateSalOrderItems(JSON.stringify(params)).then(function(json){
              if(json.type="success"){
                      var saveAlert = $alert({
                          content: '更新成功',
                          container: '#modal-alert'
                      })
                      saveAlert.$promise.then(function () {
                          saveAlert.show();
                      })
                      vm.orderCreating = false;
                       vm.nhmilks = json.data;
                    }
                   
                },function(json){
                  var saveAlert = $alert({
                          content: json.data.msg,
                          container: '#modal-alert'
                      })
                      saveAlert.$promise.then(function () {
                          saveAlert.show();
                    })
                  vm.orderCreating = false;
                })     
          }
    }

     DetailSalOrderModalCtrl.$inject = [ '$scope','$alert','$uibModalInstance', 'detailItem','restService'];

    function DetailSalOrderModalCtrl($scope, $alert,$uibModalInstance, detailItem, restService){
       var vm = $scope;
       vm.detailItem = detailItem;
       vm.cancelModal = cancelModal;
       vm.batchSendSalOrderByDate = function(){
            restService.batchSendSalOrderByDate({orderDate:moment(detailItem.orderDate).format('YYYY-MM-DD')}).then(function(json){
              if(json.type="success"){
                var saveAlert = $alert({
                    content: '发送成功',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                vm.orderCreating = false;
                 vm.nhmilks = json.data;
                vm.cancelModal();
              }
             
          },function(json){
            var saveAlert = $alert({
                    content: json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
              })
            vm.orderCreating = false;
          })

        }    
        function cancelModal() {
              $uibModalInstance.dismiss();
          }
    }

})();
