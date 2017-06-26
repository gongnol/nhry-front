(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ReturnBoxStatCtrl', ReturnBoxStatCtrl);

    ReturnBoxStatCtrl.$inject = ['$scope', '$state', '$alert', '$uibModal', 'restService', 'nhCommonUtil'];

    function ReturnBoxStatCtrl($scope, $state, $alert, $uibModal, rest, nhCommonUtil) {

        var vm = this;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
        $scope.search.fromDate = nhCommonUtil.offsetMon(0);
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
            	empNo:$scope.search.emp,
                dateStart: dateStart,
                dateEnd:dateEnd,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.returnBoxStatReport(params).then(function(json) {
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
        };
        vm.getData(vm.pageno); 
        //获取该组织下经销商列表信息
        rest.priceDealers().then(function(json){
            vm.dealers = json.data;
        })
        //获取该销售组织下送奶员
        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
                var result = json.type;
                if(result == 'success'){
                    vm.emps = json.data;
                }
       });
        //筛选查询
        $scope.filter = function(){
           vm.getData(vm.pageno); 
        }
        $scope.exportBox = function(){
            var params = {
                dealerId: $scope.search.dealerNo,
                empNo:$scope.search.emp,
                dateStart: dateStart,
                dateEnd:dateEnd
            }
            rest.exportReturnBox(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })
        }

    }


})();