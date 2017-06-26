(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('YearCardExportCtrl', YearCardExportCtrl);

    YearCardExportCtrl.$inject = ['$scope', '$state', '$uibModal', 'restService'];

    function YearCardExportCtrl($scope, $state, $uibModal, rest) {

        var vm = this;
        $scope.search = {};
        
        //导出年卡补偿单据
        $scope.reportycc = function(){
            var endDate='';
            var beginDate='';
            if ($scope.search.endDate != undefined) {
                endDate = moment($scope.search.endDate).format('YYYY-MM-DD')
            }
            if ($scope.search.startDate != undefined) {
                beginDate = moment($scope.search.startDate).format('YYYY-MM-DD')
            }
            var params = {
                dateStart: beginDate,
                dateEnd: endDate
            }
            rest.reportyccExport(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })
        }

    }


})();