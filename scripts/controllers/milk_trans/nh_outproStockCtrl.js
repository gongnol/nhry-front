(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('OutproStockCtrl', OutproStockCtrl);

    OutproStockCtrl.$inject = ['$scope', '$state', '$uibModal', 'restService'];

    function OutproStockCtrl($scope, $state, $uibModal, rest) {

        var vm = this;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};

        vm.getData = function(pageno) {
            var params = {
                //salesOrg: $scope.search.salesOrg,
                //branchNo:$scope.search.branchN,
               // branchGroup:$scope.search.status,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            /*rest.branchs(params).then(function(json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });*/
        };
        vm.getData(vm.pageno); // Call the function to fetch initial data on page load. 

    }


})();