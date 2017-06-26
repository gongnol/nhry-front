(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('innerSalesViewCtrl',innerSalesViewCtrl)
        .controller('MilkstationSalesCtrl', MilkstationSalesCtrl);

    MilkstationSalesCtrl.$inject = ['$scope', '$state', '$uibModal', 'restService'];

    function MilkstationSalesCtrl($scope, $state, $uibModal, rest) {

        var vm = this;
        vm.filter = filter;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数

        $scope.search = {};
        var dateStart;
        var dateEnd;
        
        
        vm.getData = function(pageno) {
            if($scope.search.fromDate!=undefined){
                dateStart = moment($scope.search.fromDate).format('YYYY-MM-DD');
            }
            if($scope.search.untilDate!=undefined){
                dateEnd = moment($scope.search.untilDate).format('YYYY-MM-DD'); 
            }
            var params = {
                empNo:$scope.search.emp,
                startDate: dateStart,
                endDate:dateEnd,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            rest.getstockInsideSalOrder(params).then(function(json) {
                vm.content = json.data.list;
                vm.total_count = json.data.total ? json.data.total : 0;
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
        function filter(){
            vm.getData(vm.pageno); 
        }
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
        $scope.showInnerSalesView = function(id) {
            var modalInst = $uibModal.open({
                templateUrl: 'views/milk_trans/nh_innerSalesView.html',
                controller: 'innerSalesViewCtrl',
                controllerAs:'data',
                size: 'lg',
                resolve: {
                   orderNo: function() {
                           return  id;
                     }
              
              }
            });
        }
    }
    /**
     * 内部销售订单查看
     * @auther gh
     */
    innerSalesViewCtrl.$inject = ['$filter', '$scope', '$state', '$uibModalInstance','orderNo', 'restService'];
    function innerSalesViewCtrl($filter,$scope,$state,$uibModalInstance,orderNo,restService){
        var vm = this;
        vm.cancelModal = cancelModal;
        
        vm.orderNo=orderNo;
        vm.getStatusLabel = getStatusLabel;
        vm.tbLoding = -1;
        vm.content = []; //定义的需要数据的集合，
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 5; //每页显示条数
        vm.getData = function(pageno) {
            vm.tbLoding = 1;
            vm.content = [];
            vm.total_count = 0;
            var params = {
                orderNo:orderNo,
                pageNum: pageno,
                pageSize: vm.itemsPerPage
            }
            restService.getstockInsideSalOrderDetail(params).then(function(json) {
                vm.tbLoding = 0;
                vm.content = json.data.list;
                vm.total_count = json.data.total;
            });
        };        
        vm.getData(vm.pageno);
  
        vm.handle = {
            statuses: [{code: '10',label: '换货'}, 
                       {code: '20',label: '缺货'},
                       {code: '30',label: '质量问题'},
                       {code: '40',label: '损毁'},
                       {code: '50',label: '拒收'},
                       {code: '80',label: '库存'},
                       {code: '90',label: '拒收复送'}
                      ]
        };
        function getStatusLabel(code, arr) {
            var label = ''
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                var item = arr[i];
                if (item.code == code) {
                    label = item.label;
                    break;
                }
            }
            return label;
        }    
        function cancelModal() {
            $uibModalInstance.dismiss('cancel');
        }
    }


})();