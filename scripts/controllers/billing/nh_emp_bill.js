/**
 * @ngdoc Controller
 * @name nh_consumer_bill
 *
 * 订户结算列表控制器
 */
(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('EmpBillCtrl', EmpBillCtrl)
        .controller('EmpBillDetailModalCtrl', EmpBillDetailModalCtrl);

    EmpBillCtrl.$inject = ['$scope', '$state', '$resource','$alert', '$uibModal', 'restService'];

    function EmpBillCtrl($scope, $state, $resource,$alert, $uibModal, rest) {

       
        var pvm = this; 
        var vm = $scope;
        vm.salConfirming = false;
        vm.thisalConfirming = false;
        pvm.content = []; //定义的需要数据的集合，
        pvm.pageno = 1; // 初始化页码为1
        pvm.total_count = 0; //页码总数
        pvm.itemsPerPage = 10; //每页显示条数
       /* var startDate = new Date();  
        startDate.setDate(1);

        var endDate = new Date(startDate);  
        endDate.setMonth(startDate.getMonth()+1);  

        endDate.setDate(0);  */
        var now = new Date();
        var lastMonth = new Date(now.getFullYear(),now.getMonth()-1,now.getDate());

        var thisMonth = new Date(now.getFullYear(),now.getMonth(),now.getDate());


        vm.search = {
             "salDate":lastMonth
          /*  "startDate":startDate,
            "endDate":endDate*/
        };
        rest.branchSearch().then(function(json){
              vm.branchs = json.data;   
        });

        vm.confirmSal = function(){
            vm.salConfirming = true;
            vm.search.salDate = lastMonth;
            rest.setBranchEmpSalary().then(function(json){
                vm.salConfirming = false;
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
                 var saveAlert = $alert({
                    content: '结算成功',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
               
            }, function(json){
                vm.salConfirming = false;
                var saveAlert = $alert({
                    content: '结算失败'+json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
        }

        vm.confirmThisSal = function(){
            vm.thisalConfirming = true;
            vm.search.salDate = thisMonth;
            rest.setBranchEmpSalaryThisMonth().then(function(json){
                vm.thisalConfirming = false;
                var saveAlert = $alert({
                    content: '结算成功',
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
                //pvm.getData(pvm.pageno);
            },function(json){
                vm.thisalConfirming = false;
                var saveAlert = $alert({
                    content: '结算失败'+json.data.msg,
                    container: '#body-alert'
                })
                saveAlert.$promise.then(function () {
                    saveAlert.show();
                })
            });
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

        
        pvm.getData = function(pageno){ 
            //分页请求数据，参数 为页码，请求数据最终要放到service里
            var params = {
                pageNum: pageno,
                pageSize: pvm.itemsPerPage,
                branchNo:vm.search.branch,
                status:vm.search.empNo,
                salDate:vm.search.salDate,
               /* startDate: vm.search.startDate,
                endDate: vm.search.endDate*/
            }
            //alert(JSON.stringify(params));
            rest.searchEmpSalaryRep(params).then(function (json) {
               // alert(JSON.stringify(json));
                pvm.content = json.data.list;
                pvm.total_count = json.data.total;
            });
        };
        pvm.getData(pvm.pageno); // Call the function to fetch initial data on page load. 


        vm.billDetail = function(empSalLsh) {
            var modalInst = $uibModal.open({
                templateUrl: 'views/billing/nh_emp_bill_detail.html',
                controller: 'EmpBillDetailModalCtrl',
                size: 'lg',
                resolve: {
                    salLshItem: function() {
                        return empSalLsh;
                    }
                }
            });
        }

        vm.filter = function(){
            pvm.getData(pvm.pageno);
        }
    }

    EmpBillDetailModalCtrl.$inject = ['$scope', '$uibModalInstance', 'salLshItem', 'restService'];

    function EmpBillDetailModalCtrl($scope, $uibModalInstance, salLshItem,restService) {
        var vm = $scope;
        vm.cancelModal = cancelModal;
         restService.getEmpSalaryBySalaryNo(salLshItem).then(function (json) {
               //alert(JSON.stringify(json.data));
                vm.bill = json.data;
            });
      

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }
    
})();