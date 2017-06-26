(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('DayMstDispNumStatCtrl', DayMstDispNumStatCtrl);

    DayMstDispNumStatCtrl.$inject = ['$rootScope', '$scope', '$state', '$alert', '$uibModal', 'restService'];

    function DayMstDispNumStatCtrl($rootScope, $scope, $state, $alert, $uibModal, rest) {

        var vm = this;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
        var dateStart;
        var dateEnd;
        vm.getData = function(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            if($scope.search.fromDate!=undefined){
                dateStart = moment($scope.search.fromDate).format('YYYY-MM-DD');
            }
            if($scope.search.untilDate!=undefined){
                dateEnd = moment($scope.search.untilDate).format('YYYY-MM-DD'); 
            }
            
            var params = {
            	dealerId: $scope.search.dealerNo,
            	branchNo:$scope.search.branchNo,
                dateStart: dateStart,
                dateEnd:dateEnd,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.dayMstDispNumStat(params).then(function(json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total ? json.data.total : 0;
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

        vm.typeSelected = function(data){
            if(data!=undefined){
                vm.choseStation = true;
                rest.getBranchByDealer(data.dealerNo).then(function(json){
                    vm.milkStations = json.data;
                })                
            }else {
                vm.choseStation = false;
            }
        }
        
        //筛选查询
        $scope.filter = function(){
           vm.getData(vm.pageno); 
        }

        if ($rootScope.$storage.user && $rootScope.$storage.user.dealerId && !$rootScope.$storage.user.branchNo) {
            vm.dealers = [{
                dealerNo: $rootScope.$storage.user.dealerId, 
                dealerName: $rootScope.$storage.user.dealerName
            }];
            $scope.search.dealerNo = $rootScope.$storage.user.dealerId;
            vm.typeSelected(vm.dealers[0]);
        } else {
            //获取该组织下经销商列表信息
            rest.priceDealers().then(function(json){
                vm.dealers = json.data;
            })
        }

        vm.getData(vm.pageno);

    }


})();