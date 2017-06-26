(function() {
    'use strict';
     angular
        .module('newhope')
        .controller('AccountRptCtrl', AccountRptCtrl);

    AccountRptCtrl.$inject = ['$scope','$state', '$alert', '$uibModal', 'restService'];
    function AccountRptCtrl($scope, $state, $alert, $uibModal, rest) {

        var pvm = this; 
        var vm = $scope;
        pvm.tbLoding = -1;
        pvm.content = []; //定义的需要数据的集合，
        pvm.pageno = 1; // 初始化页码为1
        pvm.curPageno = 1;
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
        vm.search = {};
        rest.branchSearch().then(function(json){
              vm.branchs = json.data;   
        });
      /*  rest.getDealerBySalesOrg().then(function(json){
              vm.dealers = json.data;   
        });*/
        vm.selectBranch = function(branchNo){
             rest.getAllMilkmanByBranchNo(branchNo,'milkMan').then(function(json){
              vm.emps = json.data;   
             });
        }

        rest.getAllMilkmanByBranchNo(vm.search.branch,'milkMan').then(function(json){
              vm.emps = json.data;   
        });

        pvm.getData = function(pageno){ 
            pvm.tbLoding = 1;
            pvm.content = [];
            pvm.total_count = 0;
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            var params = {
                pageNum: pageno,
                pageSize: pvm.itemsPerPage,
                branchNo:vm.search.branch,
                dealerNo:vm.search.dealer,
                empNo:vm.search.emp,
                startDate: vm.search.startDate,
                endDate: vm.search.endDate
            }
            //alert(JSON.stringify(params));
            rest.empAccountReceAmount(params).then(function (json) {
                pvm.tbLoding = 0;
               // alert(JSON.stringify(json));
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
            }, function (reject) {
                var errorAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
                pvm.tbLoding = 0;
            });
        };

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

        
        pvm.getData(pvm.pageno); // Call the function to fetch initial data on page load. 

        vm.filter = function(){
             pvm.curPageno = 1;
             pvm.getData(1); 
        }

    }

})();