(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('YearcardPriceCtrl', YearcardPriceCtrl);

	YearcardPriceCtrl.$inject = ['$state', '$stateParams', '$scope', '$alert', '$uibModal', 'restService'];

	function YearcardPriceCtrl($state, $stateParams, $scope, $alert, $uibModal, rest) {

        var vm = this;
        vm.getData = getData;
        vm.orgPriceCreate = false;
        // var today = moment(new Date()).format('YYYY-MM-DD');
        vm.search = {};
        // vm.search.untilDate = today;
        vm.search.status = 'Y';
       
        vm.statuses = [{'code':'Y','text':'执行价格'},{'code':'N','text':'历史价格'},];
        vm.getData();
        
        function getData() {
            var params = {
                endDate: vm.search.untilDate,
                search: vm.search.search,
                status:vm.search.status
            }
            rest.selectYearcardPriceList(params).then(function (json) {
                vm.orgPirce = json.data;
            }, function (reject) {
                var errorAlert = $alert({
                    title: reject.data.type,
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
            });
        }
        $scope.doSearch = function(){
            vm.getData();
        }
        vm.upPrices = function(){
        	vm.orgPriceCreate = true;
            var params = {
                endDate: vm.search.untilDate,
                search: vm.search.search,
                status: vm.search.status
            }
        	rest.upYearcardPriceList(vm.orgPirce).then(function(json){
        		if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '价格修改成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                        vm.orgPriceCreate = false;
						rest.selectYearcardPriceList(params).then(function(json) {
							vm.orgPirce = json.data;
						})
                    })
                    
                }
            }, function (reject) {
                var errorAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                    vm.orgPriceCreate = false;
                })
            })
        }
        vm.upOnePrice = function(param){
            var params = {
                endDate: vm.search.untilDate,
                search: vm.search.search,
                status: vm.search.status
            }
            console.log(param)
        	rest.upYearcardPrice(param).then(function(json){
        		if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '价格修改成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                        console.log(params)
                        rest.selectYearcardPriceList(params).then(function(json) {
							vm.orgPirce = json.data;
						})
                    })
                }
            }, function (reject) {
                var errorAlert = $alert({
                    content: reject.data.msg,
                    container: '#modal-alert'
                })
                errorAlert.$promise.then(function () {
                    errorAlert.show();
                })
            })
        }

	}

})();