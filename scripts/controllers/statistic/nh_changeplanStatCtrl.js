(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('ChangeplanStatCtrl', ChangeplanStatCtrl);

    ChangeplanStatCtrl.$inject = ['$rootScope', '$scope', '$state', '$alert', '$uibModal', 'restService'];

    function ChangeplanStatCtrl($rootScope, $scope, $state, $alert, $uibModal, rest) {

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
                dateStart: dateStart,
                dateEnd:dateEnd,
                dealerId:$scope.search.dealerNo,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.findChangeplanStatReport(params).then(function(json) {
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

        if ($rootScope.$storage.user && $rootScope.$storage.user.dealerId && !$rootScope.$storage.user.branchNo) {
            vm.dealers = [{
                dealerNo: $rootScope.$storage.user.dealerId, 
                dealerName: $rootScope.$storage.user.dealerName
            }];
            $scope.search.dealerNo = $rootScope.$storage.user.dealerId;
        } else {
            //获取该组织下经销商列表信息
            rest.priceDealers().then(function(json){
                vm.dealers = json.data;
            })
        }

        vm.getData(vm.pageno); 

        vm.handle = {
            statuses: [{
                code: '10',
                label: '公司原因'
            }, {
                code: '20',
                label: '质量问题'
            },{
                code: '30',
                label: '运输损坏'
            }]
        };
        vm.getStatusLabel = getStatusLabel;
        function getStatusLabel(code, arr) {
            var label = '',
                len = arr.length;
            for (var i = 0; i < len; i++) {
                var item = arr[i];
                if (item.code == code) {
                    label = item.label;
                    break;
                }
            }
            return label;
        } 
        $scope.filter = function(){
           vm.getData(vm.pageno); 
        }

    }


})();