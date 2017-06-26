(function() {
	'use strict';
	angular
	  .module('newhope')
	  .controller('OrginfoPriceCtrl', OrginfoPriceCtrl);

	OrginfoPriceCtrl.$inject = ['$state', '$stateParams', '$scope', '$alert', '$uibModal', 'restService'];

	function OrginfoPriceCtrl($state, $stateParams, $scope, $alert, $uibModal, rest) {

        var vm = this,
        orgId = $stateParams.orgId;
        vm.getData = getData;
        vm.orgPriceCreate = false;
        var today = moment(new Date()).format('YYYY-MM-DD');
        vm.search = {};
        //vm.search.untilDate = today;
        vm.search.status = 'Y';
       
        vm.statuses = [{'code':'Y','text':'执行价格'},{'code':'N','text':'历史价格'},];
        vm.getData();
        
        function getData() {
            var params = {
                orgId: orgId,
                endDate: vm.search.untilDate,
                search: vm.search.search,
                status:vm.search.status
            }
            rest.selectOrgPriceList(params).then(function (json) {
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
        vm.upOrgPrice = function(){
        	vm.orgPriceCreate = true;
        	rest.upOrgPriceList(vm.orgPirce).then(function(json){
        		if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '价格修改成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                        vm.orgPriceCreate = false;
						rest.selectOrgPriceList(params).then(function(json) {
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
        vm.upOneOrgPrice = function(param){
            var params = {
                orgId: orgId,
                endDate: vm.search.untilDate,
                search: vm.search.search
            }
            console.log(param)
        	rest.upOrgPrice(param).then(function(json){
        		if (json.type === 'success') {
                    var saveAlert = $alert({
                        content: '价格修改成功！',
                        container: '#modal-alert'
                    })
                    saveAlert.$promise.then(function () {
                        saveAlert.show();
                        console.log(params)
                        rest.selectOrgPriceList(params).then(function(json) {
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