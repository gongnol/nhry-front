(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('BranchDataCheckCtrl', BranchDataCheckCtrl);

    BranchDataCheckCtrl.$inject = ['$scope', '$state', '$uibModal', 'restService'];

    function BranchDataCheckCtrl($scope, $state, $uibModal, rest) {

        var vm = this;
        $scope.search = {};
        //获取该销售组织下送奶员
        rest.getAllMilkmanByBranchNo('','milkMan').then(function (json) {
                var result = json.type;
                if(result == 'success'){
                    vm.emps = json.data;
                }
       });
        //获取该奶站下可销售的产品
        rest.branchCellList().then(function (json) {
                var result = json.type;
                if(result == 'success'){
                    vm.maraEx = json.data;
                }
       });
        //配送时间
        vm.dayrouteStatuses = [{
            code: '10',
            label: '上午配送'
        }, {
            code: '20',
            label: '下午配送'
        }]
        //导出路单明细
        $scope.reportRouteTabel = function(){
            var empList = [];
            var notsellList = [];
            var endDate='';
            var beginDate='';
            var reachTimeType='';
            if ($scope.search.endDate != undefined) {
                endDate = moment($scope.search.endDate).format('YYYY-MM-DD')
            }
            if ($scope.search.startDate != undefined) {
                beginDate = moment($scope.search.startDate).format('YYYY-MM-DD')
            }
            if ($scope.search.reachTimeType != undefined) {
                reachTimeType = $scope.search.reachTimeType
            }
            if ($scope.search.selectedEmplList != undefined) {
                $scope.search.selectedEmplList.forEach(function(ele) {
                    empList.push(
                        ele.empNo
                    )
                })
            }
            if ($scope.search.selectedNotsellList != undefined) {
                $scope.search.selectedNotsellList.forEach(function(ele) {
                    notsellList.push(
                        ele.matnr
                    )
                })
            }
            var params = {
                confirmMatnrs:notsellList,
                empNos:empList,
                reachTimeType:reachTimeType,
                beginDate: beginDate,
                endDate: endDate
            }
            rest.reportDispItem(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })
        }
        //导出日计划明细
        $scope.reportdayTabel = function(){
            var empList = [];
            var notsellList = [];
            var endDate='';
            var beginDate='';
           // var reachTimeType='';
            if ($scope.search.dayendDate != undefined) {
                endDate = moment($scope.search.dayendDate).format('YYYY-MM-DD')
            }
            if ($scope.search.daystartDate != undefined) {
                beginDate = moment($scope.search.daystartDate).format('YYYY-MM-DD')
            }
           /* if ($scope.search.dayreachTimeType != undefined) {
                reachTimeType = $scope.search.dayreachTimeType
            }*/
            if ($scope.search.dayselectedEmplList != undefined) {
                $scope.search.dayselectedEmplList.forEach(function(ele) {
                    empList.push(
                        ele.empNo
                    )
                })
            }
            if ($scope.search.dayselectedNotsellList != undefined) {
                $scope.search.dayselectedNotsellList.forEach(function(ele) {
                    notsellList.push(
                        ele.matnr
                    )
                })
            }
            var params = {
                matnrs:notsellList,
                empNos:empList,
               // reachTimeType:reachTimeType,
                beginDate: beginDate,
                endDate: endDate
            }
            rest.reportOrderDaliyPlan(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })            
        }

    }


})();