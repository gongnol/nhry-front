(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('OrderLogsCtrl', OrderLogsCtrl);

    OrderLogsCtrl.$inject = ['$scope', '$alert', '$rootScope', '$state', '$uibModal', 'restService', 'nhCommonUtil'];

    function OrderLogsCtrl($scope, $alert, $rootScope, $state, $uibModal, rest, nhCommonUtil) {
        var vm = this;

        vm.search = {};
        vm.search.logStart = nhCommonUtil.offsetMon(-1);
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合
        vm.curPageno = 1;
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        
        vm.getData = function(pageno){
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;

            vm.tbParams = {
                search: vm.search.fuzzySearch,
                dateStart: vm.search.logStart,
                dateEnd: vm.search.logEnd,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            };
            
            rest.getOrderOperationLog(vm.tbParams).then(function (json) {
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

        vm.getData(vm.curPageno); 
        
        vm.doFilter = function () {
            vm.curPageno = 1;
            vm.getData(1);
        }

        vm.formatMatnr = function (matnr) {
            if (matnr) {
                var reg = /^0+/;
                return matnr.replace(reg, '');
            }
            return undefined;
        }

        $scope.dateFormat = function (dateStr) {
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }
    }

})();