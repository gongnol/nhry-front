// code style: https://github.com/johnpapa/angular-styleguide 

(function() {
    'use strict';
    angular
      .module('newhope')
      .controller('DearlerSaleOrderCtrl', DearlerSaleOrderCtrl )
      .controller('SaleOrderDetailModalCtrl', SaleOrderDetailModalCtrl);
      
    DearlerSaleOrderCtrl.$inject = ['$state', '$stateParams', '$alert','$scope','$uibModal','restService'];

    function DearlerSaleOrderCtrl($state, $stateParams, $alert, $scope, $uibModal, rest) {
        var vm = this;

        vm.search = {};
        vm.search.orderDate = $stateParams.orderDate || undefined;

        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        vm.getData = getData;
        vm.detail = detail;

        vm.getData(1);

        function getData(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            
            var params = {
                orderDate: vm.search.orderDate,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };

            rest.getDealerSalOrder(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.tbLoding = 0;
            });
        }

        function detail(orderNo){
          var modalInst = $uibModal.open({
              templateUrl: 'SaleOrderDetailModal.html',
              controller: 'SaleOrderDetailModalCtrl',
              size: 'lg',
              resolve: {
                detailItem: function() {
                  return  orderNo;
                }
              }
          });
       }
     
     
    }

    SaleOrderDetailModalCtrl.$inject = ['$scope', '$uibModalInstance', 'detailItem', 'restService'];

    function SaleOrderDetailModalCtrl($scope, $uibModalInstance, detailItem, restService) {
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

})();
