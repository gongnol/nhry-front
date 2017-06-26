(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ComplainListCtrl', ComplainListCtrl);

    ComplainListCtrl.$inject = ['$scope', '$alert', '$rootScope', '$state', '$uibModal', 'restService', 'nhCommonUtil'];

    function ComplainListCtrl($scope, $alert, $rootScope, $state, $uibModal, rest, nhCommonUtil) {
        var vm = this;

        vm.search = {};
        vm.search.cplDateStart = nhCommonUtil.offsetMon(0);

        vm.choseStation = false;
        vm.content = []; //定义的需要数据的集合

        vm.initFilterData = initFilterData;
        vm.typeSelected = typeSelected;
        
        vm.getData = function(){
            vm.tbLoding = 1;
            vm.content = [];

            var params = {
                startDate: vm.search.cplDateStart,
                endDate: vm.search.cplDateEnd,
                branchNo: vm.search.branchNo
            };
            
            rest.queryCustomerComplain(params).then(function (json) {
                vm.tbLoding = 0;
                vm.content = json.data;
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
        };

        vm.initFilterData();

        function initFilterData() {
            rest.priceDealers().then(function (json) {
                vm.dealers = json.data;
            })

            if ($rootScope.$storage.user.branchNo) {
                vm.getData();
            }
        }

        function typeSelected(dealer) {
            if (dealer) {
                vm.choseStation = true;
                rest.getBranchByDealer(dealer.dealerNo).then(function(json){
                    vm.milkStations = json.data;
                }) 
            } else {
                vm.choseStation = false;
                vm.search.branchNo = undefined;
            }
        }

        $scope.doFilter = function () {
            if (!$rootScope.$storage.user.branchNo && !vm.search.branchNo) {
                var errorAlert = $alert({
                    content: "必须选择一个奶站！",
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
            } else {
                vm.getData();
            }
        }
    }
 
})();