(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('DearlerReGoodsCtrl', DearlerReGoodsCtrl)
      .controller('StationReqGoodCtrl', StationReqGoodCtrl);

	DearlerReGoodsCtrl.$inject = ['$state', '$rootScope', '$scope', '$alert', '$uibModal', 'restService'];

	function DearlerReGoodsCtrl($state, $rootScope, $scope, $alert, $uibModal, rest) {

        var vm = this;
        vm.search = {};
        vm.checkboxArrs = [];
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 50; //每页显示条数
        vm.pageSizes = [10, 20, 50, 100];
        vm.dealerName = $rootScope.$storage.user.dealerName;
        vm.dealerNo = $rootScope.$storage.user.dealerId;
        vm.batchSending = false;

        vm.getData = getData;
        vm.showDetail = showDetail;
        vm.toSalOrder = toSalOrder;
        vm.batchSend2ERP = batchSend2ERP;

        vm.getData(vm.curPageno);

        function getData(pageno) {
            vm.allChFlag = false;
            vm.checkboxArrs = [];
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            if (!vm.search.requireDate) {
                vm.search.requireDate = moment().format('YYYY-MM-DD');
            }
            
            var params = {
                dealerId: vm.dealerNo,
                requiredDate: vm.search.requireDate,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };

            rest.getDealerReqGoods(params).then(function (json) {
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

        function showDetail(orderNo) {
            var modalInst = $uibModal.open({
                templateUrl: 'dealerStationReqGoods.html',
                controller: 'StationReqGoodCtrl',
                controllerAs: 'srg',
                size: 'lg',
                resolve: {
                    orderNo: function() {
                        return orderNo;
                    }
                }
            });

        }

        function toSalOrder() {
            $state.go('newhope.salOrderByDealer', {orderDate: vm.search.requireDate || moment().format('YYYY-MM-DD')});
        }

        function batchSend2ERP() {
            if (vm.checkboxArrs.length < 1) {
                var errorAlert = $alert({
                    content: '请至少选择一个要货计划！',
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                return;
            }
            vm.batchSending = true;
            rest.batchSend2ERP({orderNos: vm.checkboxArrs}).then(function (json) {
                var alert = $alert({
                    content: '要货计划成功发送ERP',
                    container: '#modal-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                vm.batchSending = false;
                vm.getData(vm.curPageno);
            }, function (reject) {
                var errorAlert = $alert({
                    title: '要货计划发送ERP失败！',
                    content: '<br>' + reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                vm.batchSending = false;
            });
        }
	}

    StationReqGoodCtrl.$inject = ['$scope', '$alert', 'restService', '$uibModalInstance', 'orderNo'];

    function StationReqGoodCtrl($scope, $alert, rest, $uibModalInstance, orderNo) {
        var vm = this;
        vm.orderNo = orderNo;

        vm.cancelModal = cancelModal;

        rest.queryRequireDealerOrder(orderNo).then(function(json){
            vm.nhmilks = json.data.entries;
            vm.status = json.data.status;
        }, function(json){
            var saveAlert = $alert({
                content: ''+json.data.msg,
                container: '#body-alert'
            })
            saveAlert.$promise.then(function () {
                saveAlert.show();
            })
            vm.nhmilks = [];
        })

        $scope.$watch('srg.nhmilks', function (newVal) {
            if (newVal) {
                vm.totalGoods = getTotalgoods(newVal);
            }
        })

        function getTotalgoods(entryList) {
            var sum = 0;
            for (var i = 0, len = entryList.length; i < len; i++) {
                sum += entryList[i].qty + entryList[i].increQty;
            }
            return sum;
        }

        function cancelModal(argument) {
            $uibModalInstance.dismiss();
        }
    }

})();