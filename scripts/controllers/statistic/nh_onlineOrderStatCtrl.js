(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('OnlineOrderStatCtrl', OnlineOrderStatCtrl);

    OnlineOrderStatCtrl.$inject = ['$scope', '$state', '$uibModal', 'restService'];

    function OnlineOrderStatCtrl($scope, $state, $uibModal, rest) {

        var vm = this;
        $scope.search = {};

        //导出路单明细
        $scope.reportRouteTabel = function(){
            var endDate='';
            var beginDate='';
            if ($scope.search.endDate != undefined) {
                endDate = moment($scope.search.endDate).format('YYYY-MM-DD')
            }
            if ($scope.search.startDate != undefined) {
                beginDate = moment($scope.search.startDate).format('YYYY-MM-DD')
            }
            var params = {
                beginDate: beginDate,
                endDate: endDate
            }
            rest.orderOnlineStatReport(params).then(function(json){
                rest.reportDeliverFile(json.data);
            })
        }

    }


})();