(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('DaymilkStStatCtrl', DaymilkStStatCtrl);

    DaymilkStStatCtrl.$inject = ['$window','$filter','$rootScope', '$scope', '$state', '$alert', '$uibModal', 'restService'];

    function DaymilkStStatCtrl($window,$filter,$rootScope,$scope, $state, $alert, $uibModal, rest) {

        var vm = this;
        vm.choseStation = false;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        $scope.search = {};
        //日报表第一次访问取当天日期
        var day = new Date();
        $scope.search.fromDate = day;

        vm.getData = function(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            var params = {
                theDate: moment($scope.search.fromDate).format('YYYY-MM-DD'),
                branchNo:$scope.search.branchNo,
                dealerId:$scope.search.dealerNo,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.daybranchDayInfo(params).then(function(json) {
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
        $scope.dayReportOutput = function(){
            var searchParams={
                theDate:moment($scope.search.fromDate).format('YYYY-MM-DD'),
                branchNo:$scope.search.branchNo,
                dealerId:$scope.search.dealerNo
            }
            rest.branchDayOutput(searchParams).then(function(json){
                rest.reportDeliverFile(json.data);
                //$window.open(rest.reportUrl()+json.data, 'C-Sharpcorner', 'width=300,height=200');
            })
        }
        //格式化日期
        $scope.dateformat = function(day){
            $scope.date5 =moment(day).format('YYYY-MM-DD');
            $scope.date4 =moment(day).subtract(1, 'days').format('YYYY-MM-DD');
            $scope.date3 =moment(day).subtract(2, 'days').format('YYYY-MM-DD');
            $scope.date2 =moment(day).subtract(3, 'days').format('YYYY-MM-DD');
            $scope.date1 =moment(day).subtract(4, 'days').format('YYYY-MM-DD');           
        }
        $scope.dateformat(day);
        //查询
        $scope.filter = function(){            
            if($scope.search.fromDate!=undefined){
                $scope.dateformat($scope.search.fromDate);
            }
            vm.getData(vm.pageno);
        }
        
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
