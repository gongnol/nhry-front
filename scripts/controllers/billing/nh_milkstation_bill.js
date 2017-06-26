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
        .controller('MilkstationBillCtrl', MilkstationBillCtrl)
        .controller('EmpDetailCtrl', EmpDetailCtrl);
       

    MilkstationBillCtrl.$inject = ['$scope', '$state', '$uibModal','$alert','restService'];

    function MilkstationBillCtrl($scope, $state, $uibModal,$alert, rest) {
        var vm = this; 
        vm.custContent = []; //定义的需要数据的集合，
        vm.empContent = [];
        vm.daybookContent = [];

        vm.cust_pageno = 1; // 初始化页码为1
        vm.cust_total_count = 0; //总条目数
        vm.cust_itemsPerPage = 10; //每页显示条数

        vm.emp_pageno = 1; // 初始化页码为1
        vm.emp_total_count = 0; //总条目数
        vm.emp_itemsPerPage = 10; //每页显示条数

        $scope.search = {};
        $scope.daybookSaving = false;

        vm.dimenType = "customer";
        rest.branchSearch().then(function(json){
              $scope.custBranchs = json.data;   
              $scope.empBranchs = json.data;   
        });
        //获取该销售组织下送奶员
        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
            var result = json.type;
            if(result == 'success'){
                vm.emps = json.data;
            }
        });

        $scope.$watch('data.emps', function (newVal, oldVal) {
            if (Object.prototype.toString.call(newVal) === '[object Array]') {
                generateDaybook(newVal);
            }
        })

        function generateDaybook(emps) {
            var tmpEmpsMap = {}, tmpDaybook = [];
            emps.forEach(function (ele, idx) {
                tmpEmpsMap[ele.empNo] = idx;
                tmpDaybook[idx] = { empNo: ele.empNo, empName: ele.empName };
            })
            rest.selectAmtInitList().then(function (json) {
                if (json.type === 'success' && json.data.length > 0) {
                    json.data.forEach(function (ele) {
                        tmpDaybook[tmpEmpsMap[ele.empNo]].reAmt = ele.reAmt;
                        tmpDaybook[tmpEmpsMap[ele.empNo]].orderDate = ele.orderDate.nh_formatDate();
                        tmpDaybook[tmpEmpsMap[ele.empNo]].editFlag = true;
                    });
                }
                vm.daybookContent = tmpDaybook;
            }, function (reject) {
                var alert = $alert({
                    title: '查询台账初始化信息失败！',
                    content: '<br>' + reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
            })
        }

        vm.getCustData = function(cust_pageno){ 
            vm.custTBLoding = 1;
            vm.custContent = [];
            vm.cust_total_count = 0;
            //分页请求数据，参数 为页码，请求数据最终要放到service里
             var params = {
                pageNum: cust_pageno,
                pageSize: vm.cust_itemsPerPage,
                branchNo:$scope.search.custBranch,
                startDate: $scope.search.custStartDate,
                endDate: $scope.search.custEndDate
             
            }
          //alert(JSON.stringify(params));
            rest.customerBranchBill(params).then(function (json) {
                vm.custTBLoding = 0;
                 //console.log(JSON.stringify(json));
                 vm.custContent = json.data.list;
                 vm.cust_total_count = json.data.total;
            });
        }

        $scope.saveEmpAccount = function(){
            var startDate='';
            if ($scope.search.startDate != undefined) {
                startDate = moment($scope.search.startDate).format('YYYY-MM-DD')
            }
            var params = {
                
                empNo:$scope.search.empNo,
                orderDate:startDate,
                reAmt: $scope.search.reAmt
            }
            rest.createOutMilk(params).then(function(json){
                if(json.type == 'success'){
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#body-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            }, function (reject) {
                //console.log(reject);
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
            })
        }
        $scope.reEmpAccount = function(){
            var startDate='';
            if ($scope.search.reDate != undefined) {
                startDate = moment($scope.search.reDate).format('YYYY-MM-DD')
            }
            var params = {               
                empNo:$scope.search.reEmpNo,
                orderDate:startDate
            }
            $scope.daybookSaving = true;
            rest.createAmtsByBranch(params).then(function(json){
                if(json.type == 'success'){
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#body-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
                $scope.daybookSaving = false;
            }, function (reject) {
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                $scope.daybookSaving = false;
            })
        }
        vm.initDaybookItem = function (item) {
            if (!item.reAmt) {
                var alert = $alert({
                    content: '结余初始金额不能为空！',
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }
            var params = {
                empNo: item.empNo,
                reAmt: item.reAmt,
                orderDate: item.orderDate
            };
            rest.createOutMilk(params).then(function (json) {
                if(json.type == 'success'){
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#body-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                    item.editFlag = true;
                }
            }, function (reject) {
                var alert = $alert({
                    title: '保存失败！',
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                generateDaybook(vm.emps);
            })
        }
        vm.saveDaybookItem = function (item) {
            if (!item.reAmt) {
                var alert = $alert({
                    content: '结余初始金额不能为空！',
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                return;
            }
            var params = {
                empNo: item.empNo,
                reAmt: item.reAmt,
                orderDate: item.orderDate
            };
            rest.updateAmtInit(params).then(function (json) {
                if(json.type == 'success'){
                    var alert = $alert({
                        content: '保存成功!',
                        container: '#body-alert'
                    })
                    alert.$promise.then(function () {
                        alert.show();
                    })
                }
            }, function (reject) {
                var alert = $alert({
                    title: '保存失败！',
                    content: reject.data.msg,
                    container: '#body-alert'
                })
                alert.$promise.then(function () {
                    alert.show();
                })
                generateDaybook(vm.emps);
            })
        }
        //台帐数据导出
        $scope.reportEmpAccount = function(){
            var monthDate='';
            if ($scope.search.monthDate != undefined) {
                monthDate = moment($scope.search.monthDate).format('YYYY-MM')
            }
             var params = {               
                empNo:$scope.search.reportEmpNo,
                monthDate:monthDate
            }   
            rest.exportDispInlOrderByModel(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })

        }
        $scope.dateFormat = function (dateStr) {
            // if ('ActiveXObject' in window) {
            //     return dateStr.slice(0, 10);
            // } else {
            //     var date = new Date(dateStr);
            //     var y = date.getFullYear();
            //     var m = date.getMonth() + 1 <10 ? '0'+(date.getMonth() + 1) : date.getMonth() + 1;
            //     var d = date.getDate()<10?'0'+ date.getDate() : date.getDate();
            //     return y + '-' + m + '-' + d;
            // }
            if (dateStr && typeof(dateStr) === 'string') { 
                return moment(dateStr).format('YYYY-MM-DD');
            } else {
                return '';
            }
        }
         vm.getEmpData = function(emp_pageno){ 
            vm.empTBLoding = 1;
            vm.empContent = [];
            vm.emp_total_count = 0;
            //分页请求数据，参数 为页码，请求数据最终要放到service里
             var params = {
                pageNum: emp_pageno,
                pageSize: vm.emp_itemsPerPage,
                branchNo:$scope.search.empBranch,
                startDate: $scope.search.empStartDate,
                endDate: $scope.search.empEndDate
             
            }
            // alert(JSON.stringify(params));
            rest.empBranchBill(params).then(function (json) {
                vm.empTBLoding = 0;
                 //console.log(JSON.stringify(json));
                 vm.empContent = json.data.list;
                 vm.emp_total_count = json.data.total;
            });
        }
         $scope.custSearch = function(){
             vm.custCurPageno = 1;
             vm.getCustData(1);
         }

          $scope.empSearch = function(){
             vm.empCurPageno = 1;
             vm.getEmpData(1);
         }
       
         $scope.showDetail = function(empNo,empName,dispDate){
             var modalInst = $uibModal.open({
                templateUrl: 'EmpDetail.html',
                controller: 'EmpDetailCtrl',
                controllerAs:'data',
                size: 'lg',
                resolve: {
                    empItem: function () {
                       return {
                        "empNo":empNo,
                        "empName":empName,
                        "dispDate":dispDate
                       };
                    }
                }
                });
         }
       
    }
    
    EmpDetailCtrl.$inject = ['$scope', '$uibModalInstance', 'empItem', 'restService'];

    function EmpDetailCtrl($scope, $uibModalInstance, empItem,restService) {
       var vm = this;
        vm.content = []; //定义的需要数据的集合，
        vm.data = {};
        vm.pageno = 1; // 初始化页码为1
        vm.total_count = 0; //页码总数
        vm.itemsPerPage = 10; //每页显示条数
        
        $scope.dateFormat = function (dateStr) {
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
        //console.log(JSON.stringify(empItem));
         $scope.empName = empItem.empName;
         $scope.dispDate = empItem.dispDate;

         vm.getData = function(pageno){ 
            //分页请求数据，参数 为页码，请求数据最终要放到service里
             var params = {
                pageNum: pageno,
                pageSize: vm.itemsPerPage,
                empNo:empItem.empNo,
                dispDate:empItem.dispDate
             }
            // alert(JSON.stringify(params));
            restService.getEmpBranchBillDetail(params).then(function (json) {
                 //console.log(JSON.stringify(json));
                 vm.content = json.data.list;
                 vm.total_count = json.data.total;
            });
        }
        vm.getData(vm.pageno);

         $scope.cancelModal = cancelModal;

        function cancelModal() {
            $uibModalInstance.dismiss();
        }
    }
})();