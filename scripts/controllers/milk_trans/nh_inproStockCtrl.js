(function() {
    'use strict';
    angular
        .module('newhope')
        .controller('InproStockCtrl', InproStockCtrl);

    InproStockCtrl.$inject = ['$alert','$filter','$scope', '$state', '$uibModal', 'restService'];

    function InproStockCtrl($alert,$filter,$scope, $state, $uibModal, rest) {

        var vm = this;
        vm.content = []; //定义的需要数据的集合，
        vm.jhd={};
        $scope.showList=false;
        $scope.search = {};
        var day = new Date();
        $scope.search.fromDate = day;
        
        vm.getData = function(orderDate) {
            var params = {
                orderDate:orderDate
            }
            rest.findGiOrder(params).then(function(json) {
                vm.content = json.data;
                if(json.data!=''){
                    $scope.showList = true;
                }else{
                    $scope.showList = false;
                }
            });
        };
        vm.getData($filter("date")(day, "yyyy-MM-dd"));
        $scope.filter = function(data){
            if(data!=undefined){
                $filter("date")(data, "yyyy-MM-dd");
                vm.getData($filter("date")(data, "yyyy-MM-dd"));
            }
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
        $scope.generateJHD = function(data){
            vm.jhd.curDate = $filter("date")(data, "yyyy-MM-dd");
            rest.generateJHD(vm.jhd).then(function(json){
                if (json.type == 'success') {
                    var alert = $alert({
                        content: '生成交货单成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function() {
                        alert.show();
                    })
                vm.getData(data);
                }
            }, function(reject) {
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                alert.$promise.then(function() {
                    alert.show();
                })          
            })
        }
        $scope.getJHD =function(params){
            if(params!=undefined){
             rest.getJHDbyHands(params).then(function(json){
                if (json.type == 'success') {
                    var alert = $alert({
                        content: '生成交货单成功!',
                        container: '#modal-alert'
                    })
                    alert.$promise.then(function() {
                        alert.show();
                    })
                }
            }, function(reject) {
                var alert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                alert.$promise.then(function() {
                    alert.show();
                })          
            })               
         }else{
                var alert = $alert({
                    content: '请输入ERP要货凭证号在进行获取交货单!',
                    container: '#modal-alert'
                })
                alert.$promise.then(function() {
                    alert.show();
                })            
         }

        }
    }
})();